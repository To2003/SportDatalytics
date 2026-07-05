import Link from "next/link";
import { notFound } from "next/navigation";
import { Shirt } from "lucide-react";
import { requireUser } from "@/lib/supabase/require-user";
import { displayName } from "@/lib/display-name";
import { effectiveStatFields, emptyStatsForSport, type StatField, type SportVariant } from "@/lib/sports/stat-fields";
import DynamicStatForm from "@/components/DynamicStatForm";
import StatsSummary from "@/components/StatsSummary";
import DarkPage from "@/components/DarkPage";
import MatchStatusBadge from "@/components/MatchStatusBadge";
import UpdateMatchResultDialog from "@/components/UpdateMatchResultDialog";
import { Card, CardContent } from "@/components/ui/card";
import SubmitButton from "@/components/SubmitButton";
import { syncCallUps, saveMatchStats, updateMatchResult } from "./actions";

type MatchStatus = "scheduled" | "live" | "finished";

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string; matchId: string }>;
  searchParams: Promise<{ error?: string; resultError?: string }>;
}) {
  const { teamId, matchId } = await params;
  const { error, resultError } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: match } = await supabase
    .from("matches")
    .select(
      "id, opponent, match_date, location, team_id, status, score_home, score_away, sets, teams(name, variant_key, sports(name, stat_fields, variants))",
    )
    .eq("id", matchId)
    .single();

  if (!match) {
    notFound();
  }

  const team = Array.isArray(match.teams) ? match.teams[0] : match.teams;
  const sport = team ? (Array.isArray(team.sports) ? team.sports[0] : team.sports) : null;
  const statFields = effectiveStatFields(
    (sport?.stat_fields ?? []) as StatField[],
    (sport?.variants ?? []) as SportVariant[],
    team?.variant_key,
  );
  const status = match.status as MatchStatus;
  const sets = (match.sets ?? []) as { home: number; away: number }[];
  const isVoley = (sport?.name ?? "").toLowerCase().includes("voley");

  const { data: myMembership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();
  const isCoach = myMembership?.role === "coach";

  const [{ data: roster }, { data: callUps }, { data: statsRows }] = await Promise.all([
    supabase
      .from("team_members")
      .select("id, user_id, role, player_profiles(position, nickname)")
      .eq("team_id", teamId),
    supabase.from("match_call_ups").select("team_member_id").eq("match_id", matchId),
    supabase.from("match_stats").select("team_member_id, stats").eq("match_id", matchId),
  ]);

  const rosterUserIds = (roster ?? []).map((m) => m.user_id);
  const { data: rosterProfiles } = rosterUserIds.length
    ? await supabase.from("profiles").select("user_id, first_name, last_name, nickname").in("user_id", rosterUserIds)
    : { data: [] };
  const profileByUserId = new Map((rosterProfiles ?? []).map((p) => [p.user_id, p]));

  const calledUpIds = new Set((callUps ?? []).map((c) => c.team_member_id));
  const statsByMember = new Map((statsRows ?? []).map((s) => [s.team_member_id, s.stats]));
  // El propio jugador va primero en la lista, para que no tenga que buscar sus
  // stats entre las de todo el plantel.
  const calledUpMembers = (roster ?? [])
    .filter((m) => calledUpIds.has(m.id))
    .sort((a, b) => Number(b.user_id === user.id) - Number(a.user_id === user.id));

  return (
    <DarkPage>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href={`/teams/${teamId}/matches`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Partidos
          </Link>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 text-center py-8">
            <div className="flex items-center gap-2">
              <MatchStatusBadge status={status} />
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{team?.name}</p>

            {status === "scheduled" ? (
              <h1 className="font-heading text-2xl font-semibold">vs {match.opponent}</h1>
            ) : (
              <div className="flex items-center gap-4">
                <span className="font-heading text-xl font-semibold">{team?.name}</span>
                <span className="font-heading text-4xl font-bold text-primary">
                  {match.score_home ?? 0} — {match.score_away ?? 0}
                </span>
                <span className="font-heading text-xl font-semibold">{match.opponent}</span>
              </div>
            )}

            {isVoley && sets.length > 0 && (
              <div className="flex gap-2 text-xs text-muted-foreground">
                {sets.map((set, i) => (
                  <span key={i} className="rounded bg-muted px-2 py-1">
                    S{i + 1}: {set.home}-{set.away}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {new Date(match.match_date).toLocaleString("es-AR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
              {match.location ? ` · ${match.location}` : ""}
            </p>

            {isCoach && (
              <UpdateMatchResultDialog
                action={updateMatchResult.bind(null, teamId, matchId)}
                status={status}
                scoreHome={match.score_home}
                scoreAway={match.score_away}
                sets={sets}
                showSets={isVoley}
                error={resultError}
              />
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
        )}

        {isCoach && (
          <section>
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide mb-3">
              Convocatoria
            </h2>
            <Card>
              <CardContent>
                <form action={syncCallUps.bind(null, teamId, matchId)} className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {roster?.map((member) => {
                      const profile = Array.isArray(member.player_profiles)
                        ? member.player_profiles[0]
                        : member.player_profiles;
                      return (
                        <label
                          key={member.id}
                          className="cursor-pointer select-none rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground transition-colors"
                        >
                          <input
                            type="checkbox"
                            name="team_member_id"
                            value={member.id}
                            defaultChecked={calledUpIds.has(member.id)}
                            className="sr-only"
                          />
                          {member.user_id === user.id
                            ? "Vos"
                            : displayName(profileByUserId.get(member.user_id), profile?.nickname)}
                          {profile?.position ? ` · ${profile.position}` : ""}
                        </label>
                      );
                    })}
                  </div>
                  <SubmitButton size="sm" className="self-start" pendingLabel="Guardando...">
                    Guardar convocatoria
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <h2 className="font-heading text-lg font-semibold uppercase tracking-wide mb-3">
            Estadísticas de convocados
          </h2>
          {calledUpMembers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <Shirt className="h-10 w-10" />
                <p>Todavía no hay convocados para este partido.</p>
              </CardContent>
            </Card>
          ) : (
            <ul className="flex flex-col gap-4">
              {calledUpMembers.map((member) => {
                const isMe = member.user_id === user.id;
                const memberProfile = Array.isArray(member.player_profiles)
                  ? member.player_profiles[0]
                  : member.player_profiles;
                const hasStats = statsByMember.has(member.id);
                const initialValues =
                  statsByMember.get(member.id) ?? emptyStatsForSport({ statFields });

                return (
                  <li key={member.id}>
                    <Card>
                      <CardContent>
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                            <Shirt className="h-3.5 w-3.5 text-muted-foreground" />
                          </span>
                          {isMe
                            ? "Vos"
                            : displayName(profileByUserId.get(member.user_id), memberProfile?.nickname)}
                        </p>

                        <StatsSummary statFields={statFields} values={initialValues} />

                        {isCoach && (
                          // Cerrado por defecto en cuanto ya hay stats guardadas: al enviar el
                          // formulario la página se recarga con datos frescos y, como hasStats
                          // ahora es true, este <details> arranca colapsado mostrando el resumen.
                          <details className="group mt-3" open={!hasStats}>
                            <summary className="text-sm font-medium text-primary cursor-pointer list-none flex items-center gap-1">
                              <span className="transition-transform group-open:rotate-90">▸</span>
                              {hasStats ? "Editar stats" : "Cargar stats"}
                            </summary>
                            <div className="mt-3">
                              <DynamicStatForm
                                statFields={statFields}
                                initialValues={initialValues}
                                sportName={sport?.name}
                                action={saveMatchStats.bind(null, teamId, matchId, member.id)}
                              />
                            </div>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </DarkPage>
  );
}

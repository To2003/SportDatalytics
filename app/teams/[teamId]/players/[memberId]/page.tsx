import Link from "next/link";
import { notFound } from "next/navigation";
import { Weight, Ruler, Hand, Cake, Pencil } from "lucide-react";
import { requireUser } from "@/lib/supabase/require-user";
import { hashColor } from "@/lib/avatar";
import { formatDateOnly } from "@/lib/format-date";
import { effectiveStatFields, type StatField, type SportVariant } from "@/lib/sports/stat-fields";
import { aggregatePlayerStats, normalizePlayerStats } from "@/lib/sports/normalize-stats";
import DarkPage from "@/components/DarkPage";
import StatsSummary from "@/components/StatsSummary";
import PlayerRadarChart from "@/components/PlayerRadarChart";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SubmitButton from "@/components/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertPlayerProfile } from "../../actions";
import { upsertPersonalProfile } from "@/app/profile/actions";

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string; memberId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { teamId, memberId } = await params;
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: member } = await supabase
    .from("team_members")
    .select("id, user_id, role, player_profiles(*), teams(id, name, sports(name, positions, stat_fields))")
    .eq("id", memberId)
    .eq("team_id", teamId)
    .single();

  if (!member) {
    notFound();
  }

  const { data: myMembership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();

  const isCoach = myMembership?.role === "coach";
  const isMe = member.user_id === user.id;
  const canEdit = isCoach || isMe;

  const team = Array.isArray(member.teams) ? member.teams[0] : member.teams;
  const sport = team ? (Array.isArray(team.sports) ? team.sports[0] : team.sports) : null;
  const positions = (sport?.positions ?? []) as string[];
  const profile = Array.isArray(member.player_profiles)
    ? member.player_profiles[0]
    : member.player_profiles;
  const color = hashColor(member.id);

  const { data: personalProfile } = await supabase
    .from("profiles")
    .select("weight_kg, height_cm, birth_date, dominant_side")
    .eq("user_id", member.user_id)
    .maybeSingle();

  const [{ data: callUps }, { data: statsRows }] = await Promise.all([
    supabase
      .from("match_call_ups")
      .select(
        "match_id, matches(id, opponent, match_date, teams(name, variant_key, sports(stat_fields, variants)))",
      )
      .eq("team_member_id", memberId),
    supabase.from("match_stats").select("match_id, stats").eq("team_member_id", memberId),
  ]);

  const statsByMatch = new Map((statsRows ?? []).map((s) => [s.match_id, s.stats]));

  // El radar se calcula contra las claves base del deporte del equipo (no el
  // efectivo-por-variante): los atributos están definidos sobre esas claves, y
  // las stats extra de variantes (ej. "faltas acumuladas" de futsal) no
  // participan de ningún atributo.
  const aggregated = aggregatePlayerStats(
    (sport?.stat_fields ?? []) as StatField[],
    (statsRows ?? []).map((s) => s.stats),
  );
  const radarData = normalizePlayerStats(sport?.name, aggregated);

  const teamDataSummary = [profile?.position, profile?.jersey_number ? `#${profile.jersey_number}` : null].filter(
    Boolean,
  );
  const hasTeamData = teamDataSummary.length > 0;

  const physicalTiles = [
    personalProfile?.weight_kg && {
      icon: Weight,
      value: `${personalProfile.weight_kg}kg`,
      label: "Peso",
    },
    personalProfile?.height_cm && {
      icon: Ruler,
      value: `${personalProfile.height_cm}cm`,
      label: "Altura",
    },
    personalProfile?.dominant_side && {
      icon: Hand,
      value: personalProfile.dominant_side,
      label: "Lateralidad",
    },
    personalProfile?.birth_date && {
      icon: Cake,
      value: formatDateOnly(personalProfile.birth_date),
      label: "Nacimiento",
    },
  ].filter(Boolean) as { icon: typeof Weight; value: string; label: string }[];
  const hasPhysicalData = physicalTiles.length > 0;

  return (
    <DarkPage>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href={`/teams/${teamId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← {team?.name}
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className={`${color.bg} ${color.text} font-heading font-semibold text-lg`}>
                {profile?.jersey_number ?? "•"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide truncate">
                {isMe ? "Vos" : `Miembro ${member.id.slice(0, 8)}`}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={member.role === "coach" ? "secondary" : "default"}>
                  {member.role === "coach" ? "Entrenador" : "Jugador"}
                </Badge>
                {profile?.position && (
                  <span className="text-sm text-muted-foreground">{profile.position}</span>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardContent>
              {radarData.length > 0 && (statsRows?.length ?? 0) > 0 ? (
                <PlayerRadarChart data={radarData} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Sin stats suficientes para el radar todavía.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {canEdit && (
          <section>
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide mb-3">
              Datos del equipo
            </h2>
            <Card>
              <CardContent>
                {hasTeamData && (
                  <p className="text-sm font-medium mb-3">{teamDataSummary.join(" · ")}</p>
                )}
                <details className="group" open={!hasTeamData}>
                  <summary className="inline-flex items-center gap-1.5 text-sm font-medium text-primary cursor-pointer list-none rounded-lg border border-border px-3 py-1.5 hover:bg-muted transition-colors w-fit">
                    <Pencil className="h-3.5 w-3.5" />
                    {hasTeamData ? "Editar" : "Cargar datos del equipo"}
                  </summary>
                  <form
                    action={upsertPlayerProfile.bind(null, teamId)}
                    className="grid grid-cols-2 gap-4 mt-3"
                  >
                    <input type="hidden" name="team_member_id" value={member.id} />
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <Label>Posición</Label>
                      <Select name="position" defaultValue={profile?.position ?? ""}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sin posición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sin posición</SelectItem>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <Label htmlFor="jersey_number">N° camiseta</Label>
                      <Input
                        id="jersey_number"
                        name="jersey_number"
                        type="number"
                        defaultValue={profile?.jersey_number ?? ""}
                      />
                    </div>
                    <SubmitButton className="col-span-2" pendingLabel="Guardando...">
                      Guardar
                    </SubmitButton>
                  </form>
                </details>
              </CardContent>
            </Card>
          </section>
        )}

        {canEdit && (
          <section>
            <h2 className="font-heading text-lg font-semibold uppercase tracking-wide mb-3">
              Perfil físico
            </h2>
            <p className="text-xs text-muted-foreground -mt-2 mb-3">
              Es de la persona, no del equipo: se aplica a todos los equipos donde participa.
            </p>
            <Card>
              <CardContent>
                {hasPhysicalData && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {physicalTiles.map(({ icon: Icon, value, label }) => (
                      <div key={label} className="flex items-center gap-2 rounded-lg bg-muted p-3">
                        <Icon className="h-5 w-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold leading-none truncate">{value}</p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <details className="group" open={!hasPhysicalData}>
                  <summary className="inline-flex items-center gap-1.5 text-sm font-medium text-primary cursor-pointer list-none rounded-lg border border-border px-3 py-1.5 hover:bg-muted transition-colors w-fit">
                    <Pencil className="h-3.5 w-3.5" />
                    {hasPhysicalData ? "Editar" : "Cargar mis datos"}
                  </summary>
                  <form
                    action={upsertPersonalProfile.bind(
                      null,
                      member.user_id,
                      `/teams/${teamId}/players/${memberId}`,
                    )}
                    className="grid grid-cols-2 gap-4 mt-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="dominant_side">Lateralidad</Label>
                      <Input
                        id="dominant_side"
                        name="dominant_side"
                        defaultValue={personalProfile?.dominant_side ?? ""}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="weight_kg">Peso (kg)</Label>
                      <Input
                        id="weight_kg"
                        name="weight_kg"
                        type="number"
                        step="0.1"
                        defaultValue={personalProfile?.weight_kg ?? ""}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="height_cm">Altura (cm)</Label>
                      <Input
                        id="height_cm"
                        name="height_cm"
                        type="number"
                        step="0.1"
                        defaultValue={personalProfile?.height_cm ?? ""}
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                      <Input
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        defaultValue={personalProfile?.birth_date ?? ""}
                      />
                    </div>
                    <SubmitButton className="col-span-2" pendingLabel="Guardando...">
                      Guardar
                    </SubmitButton>
                  </form>
                </details>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <h2 className="font-heading text-lg font-semibold uppercase tracking-wide mb-3">
            Convocatorias y stats
          </h2>
          {!callUps?.length ? (
            <Card>
              <CardContent className="text-center text-muted-foreground py-8">
                Todavía no fue convocado a ningún partido.
              </CardContent>
            </Card>
          ) : (
            <ul className="flex flex-col gap-3">
              {callUps.map((callUp) => {
                const match = Array.isArray(callUp.matches) ? callUp.matches[0] : callUp.matches;
                if (!match) return null;
                const matchTeam = Array.isArray(match.teams) ? match.teams[0] : match.teams;
                const matchSport = matchTeam
                  ? Array.isArray(matchTeam.sports)
                    ? matchTeam.sports[0]
                    : matchTeam.sports
                  : null;
                const statFields = effectiveStatFields(
                  (matchSport?.stat_fields ?? []) as StatField[],
                  (matchSport?.variants ?? []) as SportVariant[],
                  matchTeam?.variant_key,
                );
                const stats = statsByMatch.get(match.id);

                return (
                  <li key={match.id}>
                    <Card>
                      <CardContent>
                        <p className="text-sm font-semibold">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {new Date(match.match_date).toLocaleDateString("es-AR")}
                        </p>
                        {stats ? (
                          <StatsSummary statFields={statFields} values={stats} />
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Sin estadísticas cargadas todavía.
                          </p>
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight, BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/supabase/require-user";
import { sportIcon } from "@/lib/sports/icons";
import { hashColor } from "@/lib/avatar";
import { displayName } from "@/lib/display-name";
import DarkPage from "@/components/DarkPage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CopyInviteCodeButton from "@/components/CopyInviteCodeButton";
import AddMemberDialog from "@/components/AddMemberDialog";
import EditTeamDialog from "@/components/EditTeamDialog";
import LeaveTeamDialog from "@/components/LeaveTeamDialog";
import SubmitButton from "@/components/SubmitButton";
import { addMember, updateTeam, generateTeamInviteCode, deleteTeam, leaveTeam } from "./actions";

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ error?: string; memberError?: string; codeError?: string }>;
}) {
  const { teamId } = await params;
  const { error, memberError, codeError } = await searchParams;
  const { supabase, user } = await requireUser();

  const [{ data: team }, { data: allSports }, { data: members }, { data: matches }] =
    await Promise.all([
      supabase
        .from("teams")
        .select(
          "id, name, description, sport_id, variant_key, invite_code, sports(id, name, positions, variants)",
        )
        .eq("id", teamId)
        .single(),
      supabase.from("sports").select("id, name, variants").order("name"),
      supabase
        .from("team_members")
        .select("id, user_id, role, player_profiles(position, jersey_number, nickname)")
        .eq("team_id", teamId)
        .order("role"),
      supabase
        .from("matches")
        .select("id, opponent, match_date")
        .eq("team_id", teamId)
        .order("match_date", { ascending: false })
        .limit(5),
    ]);

  if (!team) {
    notFound();
  }

  const memberUserIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = memberUserIds.length
    ? await supabase.from("profiles").select("user_id, first_name, last_name, nickname").in("user_id", memberUserIds)
    : { data: [] };
  const profileByUserId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
  const variants = (sport?.variants ?? []) as { key: string; label: string }[];
  const variantLabel = variants.find((v) => v.key === team.variant_key)?.label;
  const color = hashColor(team.id);

  const myMembership = members?.find((m) => m.user_id === user.id);
  const isCoach = myMembership?.role === "coach";

  const sportsForSelect = (allSports ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    variants: (s.variants ?? []) as { key: string; label: string }[],
  }));

  return (
    <DarkPage>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4 min-w-0">
            <Avatar size="lg">
              <AvatarFallback className={`${color.bg} ${color.text} font-heading font-semibold text-lg`}>
                {team.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide truncate">
                {team.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {sportIcon(sport?.name, "h-4 w-4")}
                  {sport?.name}
                </span>
                {variantLabel && <Badge variant="secondary">{variantLabel}</Badge>}
              </div>
              {team.description && (
                <p className="text-sm text-muted-foreground mt-1">{team.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
            {isCoach && (
              <EditTeamDialog
                action={updateTeam.bind(null, teamId)}
                deleteAction={deleteTeam.bind(null, teamId)}
                sports={sportsForSelect}
                team={team}
                error={error}
              />
            )}
            <LeaveTeamDialog action={leaveTeam.bind(null, teamId)} />
          </div>
        </div>

        {isCoach && (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground flex-1 min-w-[12rem]">
                Compartí este código para que se sumen desde &quot;Unirme a un equipo&quot;.
              </p>
              {team.invite_code ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-muted px-3 py-1.5 font-mono text-lg tracking-widest">
                    {team.invite_code}
                  </span>
                  <CopyInviteCodeButton code={team.invite_code} />
                </div>
              ) : null}
              <form action={generateTeamInviteCode.bind(null, teamId)}>
                <SubmitButton size="sm" variant="outline" pendingLabel="Generando...">
                  {team.invite_code ? "Regenerar código" : "Generar código"}
                </SubmitButton>
              </form>
              {codeError && <p className="text-sm text-destructive w-full">{codeError}</p>}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="plantel">
          <TabsList>
            <TabsTrigger value="plantel">Plantel</TabsTrigger>
            <TabsTrigger value="partidos">Partidos</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="plantel" className="flex flex-col gap-4 mt-4">
            {isCoach && (
              <div className="flex justify-end">
                <AddMemberDialog action={addMember.bind(null, teamId)} error={memberError} />
              </div>
            )}
            <ul className="grid gap-3 sm:grid-cols-2">
              {members?.map((member) => {
                const profile = Array.isArray(member.player_profiles)
                  ? member.player_profiles[0]
                  : member.player_profiles;
                const isMe = member.user_id === user.id;
                const memberColor = hashColor(member.id);

                return (
                  <li key={member.id}>
                    <Link href={`/teams/${teamId}/players/${member.id}`}>
                      <Card className="transition-colors hover:ring-primary/50">
                        <CardContent className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback
                              className={`${memberColor.bg} ${memberColor.text} font-heading font-semibold`}
                            >
                              {profile?.jersey_number ?? "•"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {isMe
                                ? "Vos"
                                : displayName(profileByUserId.get(member.user_id), profile?.nickname)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={member.role === "coach" ? "secondary" : "default"}>
                                {member.role === "coach" ? "Entrenador" : "Jugador"}
                              </Badge>
                              {profile?.position && (
                                <span className="text-xs text-muted-foreground">
                                  {profile.position}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </TabsContent>

          <TabsContent value="partidos" className="flex flex-col gap-3 mt-4">
            {matches?.length ? (
              <ul className="flex flex-col gap-2">
                {matches.map((match) => (
                  <li key={match.id}>
                    <Link href={`/teams/${teamId}/matches/${match.id}`}>
                      <Card className="transition-colors hover:ring-primary/50">
                        <CardContent className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">vs {match.opponent}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(match.match_date).toLocaleDateString("es-AR")}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Card>
                <CardContent className="text-center text-muted-foreground py-8">
                  Todavía no hay partidos cargados.
                </CardContent>
              </Card>
            )}
            <Link
              href={`/teams/${teamId}/matches`}
              className="text-sm font-medium text-primary hover:underline self-start"
            >
              Ver todos los partidos →
            </Link>
          </TabsContent>

          <TabsContent value="estadisticas" className="mt-4">
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10" />
                <p>Estadísticas del equipo — próximamente.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DarkPage>
  );
}

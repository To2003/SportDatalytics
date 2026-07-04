import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/supabase/require-user";
import { sportIcon } from "@/lib/sports/icons";
import { hashColor } from "@/lib/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CreateTeamDialog from "@/components/CreateTeamDialog";
import JoinTeamDialog from "@/components/JoinTeamDialog";
import DarkPage from "@/components/DarkPage";
import { createTeam, joinTeamByCode } from "./actions";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; joinError?: string }>;
}) {
  const { error, joinError } = await searchParams;
  const { supabase, user } = await requireUser();

  const [{ data: memberships }, { data: sports }] = await Promise.all([
    supabase
      .from("team_members")
      .select("role, teams(id, name, description, sports(name))")
      .eq("user_id", user.id),
    supabase.from("sports").select("id, name, variants").order("name"),
  ]);

  const teamIds = (memberships ?? [])
    .map((m) => {
      const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
      return team?.id;
    })
    .filter((id): id is string => Boolean(id));

  const { data: allMembers } = teamIds.length
    ? await supabase.from("team_members").select("team_id").in("team_id", teamIds)
    : { data: [] as { team_id: string }[] };

  const memberCounts = new Map<string, number>();
  for (const m of allMembers ?? []) {
    memberCounts.set(m.team_id, (memberCounts.get(m.team_id) ?? 0) + 1);
  }

  return (
    <DarkPage>
      <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide">
            Mis equipos
          </h1>
          <div className="flex gap-2">
            <JoinTeamDialog action={joinTeamByCode} error={joinError} />
            <CreateTeamDialog
              action={createTeam}
              error={error}
              sports={(sports ?? []).map((sport) => ({
                id: sport.id,
                name: sport.name,
                variants: (sport.variants ?? []) as { key: string; label: string }[],
              }))}
            />
          </div>
        </div>

        {!memberships || memberships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Users className="h-10 w-10" />
              <p>Todavía no formás parte de ningún equipo.</p>
              <p className="text-sm">Creá el primero o unite con un código.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {memberships.map((m) => {
              const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
              if (!team) return null;
              const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
              const color = hashColor(team.id);
              const memberCount = memberCounts.get(team.id) ?? 0;

              return (
                <li key={team.id}>
                  <Link href={`/teams/${team.id}`}>
                    <Card className="transition-colors hover:ring-primary/50">
                      <CardContent className="flex items-start gap-3">
                        <Avatar size="lg">
                          <AvatarFallback className={`${color.bg} ${color.text} font-heading font-semibold`}>
                            {team.name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {sportIcon(sport?.name, "h-4 w-4 text-muted-foreground shrink-0")}
                            <p className="font-semibold truncate">{team.name}</p>
                          </div>
                          {team.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {team.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={m.role === "coach" ? "secondary" : "default"}>
                              {m.role === "coach" ? "Entrenador" : "Jugador"}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {memberCount}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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

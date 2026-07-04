import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { requireUser } from "@/lib/supabase/require-user";
import DarkPage from "@/components/DarkPage";
import { Card, CardContent } from "@/components/ui/card";
import MatchStatusBadge from "@/components/MatchStatusBadge";
import CreateMatchDialog from "@/components/CreateMatchDialog";
import { createMatch } from "./actions";

type Match = {
  id: string;
  opponent: string;
  match_date: string;
  location: string | null;
  status: "scheduled" | "live" | "finished";
  score_home: number | null;
  score_away: number | null;
};

function groupByMonth(matches: Match[]) {
  const groups: { label: string; matches: Match[] }[] = [];
  for (const match of matches) {
    const label = new Date(match.match_date).toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
    const current = groups.at(-1);
    if (current?.label === label) {
      current.matches.push(match);
    } else {
      groups.push({ label, matches: [match] });
    }
  }
  return groups;
}

export default async function MatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { teamId } = await params;
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: team } = await supabase.from("teams").select("id, name").eq("id", teamId).single();
  if (!team) {
    notFound();
  }

  const { data: myMembership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle();
  const isCoach = myMembership?.role === "coach";

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent, match_date, location, status, score_home, score_away")
    .eq("team_id", teamId)
    .order("match_date", { ascending: false });

  const groups = groupByMonth((matches ?? []) as Match[]);

  return (
    <DarkPage>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/teams/${teamId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← {team.name}
            </Link>
            <h1 className="font-heading text-2xl font-semibold uppercase tracking-wide mt-1">
              Partidos
            </h1>
          </div>
          {isCoach && <CreateMatchDialog action={createMatch.bind(null, teamId)} error={error} />}
        </div>

        {!matches?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Calendar className="h-10 w-10" />
              <p>Todavía no hay partidos cargados.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-3">
                <h2 className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-2">
                  {group.matches.map((match) => {
                    const date = new Date(match.match_date);
                    const finished = match.status === "finished";
                    return (
                      <li key={match.id}>
                        <Link href={`/teams/${teamId}/matches/${match.id}`}>
                          <Card className="transition-colors hover:ring-primary/50">
                            <CardContent className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center rounded-xl h-14 w-14 shrink-0 bg-muted">
                                <span className="text-[10px] font-medium uppercase leading-none text-muted-foreground">
                                  {date.toLocaleDateString("es-AR", { month: "short" })}
                                </span>
                                <span className="text-lg font-bold leading-tight">
                                  {date.getDate()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">vs {match.opponent}</p>
                                <p className="text-sm text-muted-foreground">
                                  {date.toLocaleTimeString("es-AR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {match.location ? ` · ${match.location}` : ""}
                                </p>
                              </div>
                              {finished && match.score_home !== null && match.score_away !== null && (
                                <p className="font-heading text-lg font-semibold shrink-0">
                                  {match.score_home}–{match.score_away}
                                </p>
                              )}
                              <MatchStatusBadge status={match.status} />
                            </CardContent>
                          </Card>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </DarkPage>
  );
}

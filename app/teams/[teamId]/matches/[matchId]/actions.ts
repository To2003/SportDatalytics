"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function syncCallUps(teamId: string, matchId: string, formData: FormData) {
  const selectedIds = formData.getAll("team_member_id").map(String);

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("match_call_ups")
    .delete()
    .eq("match_id", matchId);

  if (deleteError) {
    redirect(`/teams/${teamId}/matches/${matchId}?error=${encodeURIComponent(deleteError.message)}`);
  }

  if (selectedIds.length > 0) {
    const { error: insertError } = await supabase.from("match_call_ups").insert(
      selectedIds.map((teamMemberId) => ({ match_id: matchId, team_member_id: teamMemberId })),
    );

    if (insertError) {
      redirect(`/teams/${teamId}/matches/${matchId}?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath(`/teams/${teamId}/matches/${matchId}`);
  redirect(`/teams/${teamId}/matches/${matchId}`);
}

export async function updateMatchResult(teamId: string, matchId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "scheduled");
  const scoreHomeRaw = String(formData.get("score_home") ?? "").trim();
  const scoreAwayRaw = String(formData.get("score_away") ?? "").trim();

  const sets: { home: number; away: number }[] = [];
  for (let i = 1; i <= 5; i++) {
    const home = String(formData.get(`set_home_${i}`) ?? "").trim();
    const away = String(formData.get(`set_away_${i}`) ?? "").trim();
    if (home === "" && away === "") continue;
    sets.push({ home: Number(home || 0), away: Number(away || 0) });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      status,
      score_home: scoreHomeRaw === "" ? null : Number(scoreHomeRaw),
      score_away: scoreAwayRaw === "" ? null : Number(scoreAwayRaw),
      sets,
    })
    .eq("id", matchId);

  if (error) {
    redirect(
      `/teams/${teamId}/matches/${matchId}?resultError=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/teams/${teamId}/matches/${matchId}`);
  revalidatePath(`/teams/${teamId}/matches`);
  redirect(`/teams/${teamId}/matches/${matchId}`);
}

export async function saveMatchStats(
  teamId: string,
  matchId: string,
  teamMemberId: string,
  formData: FormData,
) {
  const fieldDefs = JSON.parse(String(formData.get("__field_defs") ?? "[]")) as Array<{
    key: string;
    type: string;
  }>;

  const stats: Record<string, number | boolean> = {};
  for (const field of fieldDefs) {
    const raw = formData.get(field.key);
    stats[field.key] = field.type === "boolean" ? raw === "on" : Number(raw ?? 0);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("match_stats").upsert(
    { match_id: matchId, team_member_id: teamMemberId, stats },
    { onConflict: "match_id,team_member_id" },
  );

  if (error) {
    redirect(`/teams/${teamId}/matches/${matchId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/teams/${teamId}/matches/${matchId}`);
  redirect(`/teams/${teamId}/matches/${matchId}`);
}

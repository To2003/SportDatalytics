"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMatch(teamId: string, formData: FormData) {
  const opponent = String(formData.get("opponent") ?? "").trim();
  const matchDate = String(formData.get("match_date") ?? "");
  const location = String(formData.get("location") ?? "").trim();

  if (!opponent || !matchDate) {
    redirect(`/teams/${teamId}/matches?error=Completá rival y fecha`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("matches").insert({
    team_id: teamId,
    opponent,
    match_date: new Date(matchDate).toISOString(),
    location: location || null,
  });

  if (error) {
    redirect(`/teams/${teamId}/matches?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/teams/${teamId}/matches`);
  redirect(`/teams/${teamId}/matches`);
}

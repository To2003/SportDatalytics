"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sportId = String(formData.get("sport_id") ?? "");
  const variantKey = String(formData.get("variant_key") ?? "").trim();

  if (!name || !sportId) {
    redirect("/teams?error=Completá nombre y deporte");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("teams").insert({
    name,
    description: description || null,
    sport_id: sportId,
    variant_key: variantKey || null,
    created_by: user.id,
  });

  if (error) {
    redirect(`/teams?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/teams");
  redirect("/teams");
}

export async function joinTeamByCode(formData: FormData) {
  const code = String(formData.get("invite_code") ?? "")
    .trim()
    .toUpperCase();

  if (!code) {
    redirect(`/teams?joinError=${encodeURIComponent("Ingresá un código")}`);
  }

  const supabase = await createClient();
  const { data: teamId, error } = await supabase.rpc("join_team_by_code", { _code: code });

  if (error || !teamId) {
    redirect(
      `/teams?joinError=${encodeURIComponent(error?.message ?? "Código de invitación inválido")}`,
    );
  }

  revalidatePath("/teams");
  redirect(`/teams/${teamId}`);
}

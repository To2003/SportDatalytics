"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/teams/invite-code";

export async function updateTeam(teamId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sportId = String(formData.get("sport_id") ?? "");
  const variantKey = String(formData.get("variant_key") ?? "").trim();

  if (!name || !sportId) {
    redirect(`/teams/${teamId}?error=${encodeURIComponent("Completá nombre y deporte")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({
      name,
      description: description || null,
      sport_id: sportId,
      variant_key: variantKey || null,
    })
    .eq("id", teamId);

  if (error) {
    redirect(`/teams/${teamId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}`);
}

// El segundo parámetro no se usa (el form no tiene inputs), pero el tipo de
// action de un <form> requiere aceptar FormData como último argumento.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateTeamInviteCode(teamId: string, formData: FormData) {
  const supabase = await createClient();

  // Reintenta si el código random choca con uno existente (columna unique).
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase
      .from("teams")
      .update({ invite_code: generateInviteCode() })
      .eq("id", teamId);

    if (!error) break;
    if (attempt === 4) {
      redirect(`/teams/${teamId}?codeError=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}`);
}

export async function addMember(teamId: string, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "player");

  const supabase = await createClient();

  const { data: userId, error: lookupError } = await supabase.rpc("user_id_by_email", {
    _email: email,
  });

  if (lookupError || !userId) {
    redirect(
      `/teams/${teamId}?memberError=${encodeURIComponent("No se encontró un usuario con ese email")}`,
    );
  }

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: userId,
    role: role === "coach" ? "coach" : "player",
  });

  if (error) {
    redirect(`/teams/${teamId}?memberError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}`);
}

// El form de confirmación no manda campos propios, pero el tipo de action de
// un <form> requiere aceptar FormData igual.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteTeam(teamId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) {
    redirect(`/teams/${teamId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/teams");
  redirect("/teams");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function leaveTeam(teamId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/teams/${teamId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/teams");
  redirect("/teams");
}

export async function updateMemberRole(teamId: string, memberId: string, formData: FormData) {
  const role = String(formData.get("role") ?? "player");

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_members")
    .update({ role: role === "coach" ? "coach" : "player" })
    .eq("id", memberId);

  if (error) {
    redirect(`/teams/${teamId}/players/${memberId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/teams/${teamId}/players/${memberId}`);
  redirect(`/teams/${teamId}/players/${memberId}`);
}

// El form de confirmación no manda campos propios (solo confirma el borrado),
// pero el tipo de action de un <form> requiere aceptar FormData igual.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeMember(teamId: string, memberId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", memberId);

  if (error) {
    redirect(`/teams/${teamId}/players/${memberId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/teams/${teamId}`);
  redirect(`/teams/${teamId}`);
}

export async function upsertPlayerProfile(teamId: string, formData: FormData) {
  const teamMemberId = String(formData.get("team_member_id") ?? "");
  const position = String(formData.get("position") ?? "") || null;
  const jerseyRaw = String(formData.get("jersey_number") ?? "");

  const supabase = await createClient();

  // Peso/altura/nacimiento/lateralidad viven en `profiles` (una por persona,
  // no por equipo) — se editan con `upsertPersonalProfile` desde /profile o
  // desde la página del jugador. Acá solo lo que sí es específico del equipo.
  const { error } = await supabase.from("player_profiles").upsert(
    {
      team_member_id: teamMemberId,
      position,
      jersey_number: jerseyRaw ? Number(jerseyRaw) : null,
    },
    { onConflict: "team_member_id" },
  );

  if (error) {
    redirect(
      `/teams/${teamId}/players/${teamMemberId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/teams/${teamId}`);
  revalidatePath(`/teams/${teamId}/players/${teamMemberId}`);
  redirect(`/teams/${teamId}/players/${teamMemberId}`);
}

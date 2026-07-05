"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// A diferencia de upsertPersonalProfile, esto es exclusivamente de la propia
// persona (no lo puede tocar un coach) — por eso no recibe targetUserId ni
// redirectTo, siempre opera sobre el usuario logueado y vuelve a /profile.
export async function upsertPersonalIdentity(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim() || null;

  if (!firstName || !lastName) {
    redirect(`/profile?error=${encodeURIComponent("Completá nombre y apellido")}`);
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      nickname,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  redirect("/profile");
}

// Un solo action para los dos casos de uso (uno mismo desde /profile, o un
// coach editando a un jugador desde su página de equipo): solo depende del
// user_id destino, no de a qué equipo pertenece — el dato es de la persona,
// no del equipo.
export async function upsertPersonalProfile(
  targetUserId: string,
  redirectTo: string,
  formData: FormData,
) {
  const weightRaw = String(formData.get("weight_kg") ?? "").trim();
  const heightRaw = String(formData.get("height_cm") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim() || null;
  const dominantSide = String(formData.get("dominant_side") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: targetUserId,
      weight_kg: weightRaw ? Number(weightRaw) : null,
      height_cm: heightRaw ? Number(heightRaw) : null,
      birth_date: birthDate,
      dominant_side: dominantSide,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(redirectTo);
  redirect(redirectTo);
}

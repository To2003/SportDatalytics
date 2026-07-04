"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

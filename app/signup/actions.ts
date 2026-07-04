"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signup(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect(
      `/signup?error=${encodeURIComponent("Supabase no está configurado todavía (falta .env.local)")}`,
    );
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Revisá tu email para confirmar la cuenta");
}

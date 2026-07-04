import { redirect } from "next/navigation";
import { createClient } from "./server";
import { isSupabaseConfigured } from "./config";

// Server components should call this instead of createClient()+getUser() directly:
// it sends unauthenticated *and* unconfigured (no .env.local yet) visitors to /login
// instead of crashing with a raw Supabase "URL and Key are required" error.
export async function requireUser() {
  if (!isSupabaseConfigured) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

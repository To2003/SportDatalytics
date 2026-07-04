import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Ver nota en lib/supabase/client.ts sobre por qué no se usa el generic <Database>.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component without a mutable cookie store;
            // safe to ignore when middleware refreshes the session instead.
          }
        },
      },
    },
  );
}

import { createBrowserClient } from "@supabase/ssr";

// Nota: sin el generic <Database> a propósito. Escribir esos tipos a mano no
// modela relaciones (FKs), y forzarlo rompe la inferencia de tipos en selects
// con joins (`teams(name, sports(...))`). Usar tipos generados con
// `supabase gen types` si hace falta tipado estricto más adelante.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

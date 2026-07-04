import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import LogoutButton from "@/components/LogoutButton";

export default async function Nav() {
  const user = isSupabaseConfigured
    ? (await (await createClient()).auth.getUser()).data.user
    : null;

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-950/90 border-b border-slate-800">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/teams" className="flex items-center gap-2 font-heading font-semibold uppercase tracking-wide text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-cyan-400">
            <Trophy className="h-4.5 w-4.5" />
          </span>
          <span className="hidden sm:inline">Sports Datalytics</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/profile" className="text-slate-400 hover:text-cyan-400 transition-colors">
              Mi perfil
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-slate-400 hover:text-cyan-400 transition-colors">
              Ingresar
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-cyan-400 text-slate-950 font-semibold px-3 py-1.5 hover:bg-cyan-300 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
      {!isSupabaseConfigured && (
        <p className="bg-yellow-400/10 text-yellow-400 text-xs text-center py-1">
          Supabase no está configurado — copiá .env.local.example a .env.local con tus credenciales.
        </p>
      )}
    </header>
  );
}

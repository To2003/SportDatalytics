import Link from "next/link";
import { Weight, Ruler, Hand, Cake, Pencil } from "lucide-react";
import { requireUser } from "@/lib/supabase/require-user";
import { formatDateOnly } from "@/lib/format-date";
import { effectiveStatFields, type StatField, type SportVariant } from "@/lib/sports/stat-fields";
import { sportIcon } from "@/lib/sports/icons";
import Card from "@/components/legacy-ui/Card";
import Badge from "@/components/legacy-ui/Badge";
import { Input, Label } from "@/components/legacy-ui/Field";
import StatsSummary from "@/components/legacy-ui/StatsSummary";
import SubmitButton from "@/components/legacy-ui/SubmitButton";
import { upsertPersonalProfile } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase, user } = await requireUser();

  const [{ data: memberships }, { data: personalProfile }] = await Promise.all([
    supabase.from("team_members").select("id, role, teams(id, name, sports(name))").eq("user_id", user.id),
    supabase
      .from("profiles")
      .select("weight_kg, height_cm, birth_date, dominant_side")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const memberIds = (memberships ?? []).map((m) => m.id);

  const [{ data: callUps }, { data: statsRows }] = await Promise.all([
    memberIds.length
      ? supabase
          .from("match_call_ups")
          .select(
            "team_member_id, matches(id, opponent, match_date, teams(name, variant_key, sports(stat_fields, variants)))",
          )
          .in("team_member_id", memberIds)
      : Promise.resolve({ data: [] }),
    memberIds.length
      ? supabase.from("match_stats").select("team_member_id, match_id, stats").in("team_member_id", memberIds)
      : Promise.resolve({ data: [] }),
  ]);

  const statsByMatchAndMember = new Map(
    (statsRows ?? []).map((s) => [`${s.match_id}:${s.team_member_id}`, s.stats]),
  );

  const initial = user.email?.[0]?.toUpperCase() ?? "?";

  const physicalTiles = [
    personalProfile?.weight_kg && {
      icon: Weight,
      value: `${personalProfile.weight_kg}kg`,
      label: "Peso",
    },
    personalProfile?.height_cm && {
      icon: Ruler,
      value: `${personalProfile.height_cm}cm`,
      label: "Altura",
    },
    personalProfile?.dominant_side && {
      icon: Hand,
      value: personalProfile.dominant_side,
      label: "Lateralidad",
    },
    personalProfile?.birth_date && {
      icon: Cake,
      value: formatDateOnly(personalProfile.birth_date),
      label: "Nacimiento",
    },
  ].filter(Boolean) as { icon: typeof Weight; value: string; label: string }[];
  const hasPhysicalData = physicalTiles.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <Card className="p-6 bg-gradient-to-br from-accent-400 to-accent-600 text-white flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold border-2 border-white/40">
          {initial}
        </span>
        <div>
          <h1 className="text-xl font-bold">Mi perfil</h1>
          <p className="text-sm text-accent-50">{user.email}</p>
        </div>
      </Card>

      <section>
        <h2 className="text-lg font-bold text-brand-900 mb-3">Mis equipos</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {memberships?.map((m) => {
            const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
            if (!team) return null;
            const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
            return (
              <li key={m.id}>
                <Link href={`/teams/${team.id}`}>
                  <Card hover className="p-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
                      {sportIcon(sport?.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900 truncate">{team.name}</p>
                      <Badge tone={m.role === "coach" ? "accent" : "brand"} className="mt-1">
                        {m.role === "coach" ? "Entrenador" : "Jugador"}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-zinc-500 mt-3">
          Tu posición y número de camiseta son por equipo — se editan desde cada equipo.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-900 mb-3">Mi perfil físico</h2>
        <p className="text-xs text-zinc-500 mb-3">
          Se aplica a todos los equipos donde participás, no hace falta cargarlo por separado.
        </p>
        <Card className="p-5">
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {hasPhysicalData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {physicalTiles.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-brand-50 p-3">
                  <Icon className="h-5 w-5 text-brand-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-900 leading-none truncate">{value}</p>
                    <p className="text-xs text-zinc-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <details className="group" open={!hasPhysicalData}>
            <summary className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 cursor-pointer list-none rounded-lg border border-brand-200 px-3 py-1.5 hover:bg-brand-50 transition-colors w-fit">
              <Pencil className="h-3.5 w-3.5" />
              {hasPhysicalData ? "Editar" : "Cargar mis datos"}
            </summary>
            <form
              action={upsertPersonalProfile.bind(null, user.id, "/profile")}
              className="grid grid-cols-2 gap-4 mt-3"
            >
              <Label className="col-span-2">
                Lateralidad
                <Input name="dominant_side" defaultValue={personalProfile?.dominant_side ?? ""} />
              </Label>
              <Label>
                Peso (kg)
                <Input
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  defaultValue={personalProfile?.weight_kg ?? ""}
                />
              </Label>
              <Label>
                Altura (cm)
                <Input
                  name="height_cm"
                  type="number"
                  step="0.1"
                  defaultValue={personalProfile?.height_cm ?? ""}
                />
              </Label>
              <Label className="col-span-2">
                Fecha de nacimiento
                <Input
                  name="birth_date"
                  type="date"
                  defaultValue={personalProfile?.birth_date ?? ""}
                />
              </Label>
              <SubmitButton className="col-span-2" pendingLabel="Guardando...">
                Guardar
              </SubmitButton>
            </form>
          </details>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-bold text-brand-900 mb-3">Mis convocatorias y stats</h2>
        {!callUps?.length ? (
          <Card className="p-8 text-center text-zinc-500">
            <p className="text-4xl mb-2">🎯</p>
            <p>Todavía no fuiste convocado a ningún partido.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {callUps.map((callUp) => {
              const match = Array.isArray(callUp.matches) ? callUp.matches[0] : callUp.matches;
              if (!match) return null;
              const team = Array.isArray(match.teams) ? match.teams[0] : match.teams;
              const sport = team ? (Array.isArray(team.sports) ? team.sports[0] : team.sports) : null;
              const statFields = effectiveStatFields(
                (sport?.stat_fields ?? []) as StatField[],
                (sport?.variants ?? []) as SportVariant[],
                team?.variant_key,
              );
              const stats = statsByMatchAndMember.get(`${match.id}:${callUp.team_member_id}`);

              return (
                <li key={`${match.id}-${callUp.team_member_id}`}>
                  <Card className="p-4">
                    <p className="font-semibold text-sm text-zinc-900">
                      {team?.name} vs {match.opponent}
                    </p>
                    <p className="text-xs text-zinc-500 mb-3">
                      {new Date(match.match_date).toLocaleString("es-AR")}
                    </p>
                    {stats ? (
                      <StatsSummary statFields={statFields} values={stats} />
                    ) : (
                      <p className="text-xs text-zinc-500">Sin estadísticas cargadas todavía.</p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

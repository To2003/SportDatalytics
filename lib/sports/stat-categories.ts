import { sortStatFields, type StatField } from "@/lib/sports/stat-fields";

export type CategoryKind = "ataque" | "definicion" | "defensa" | "especial" | "disciplina" | "general";

// Mismo color para el mismo "kind" en todos los deportes: un coach que maneja
// varios equipos aprende el código una sola vez.
export const CATEGORY_STYLES: Record<CategoryKind, { label: string; borderClass: string }> = {
  ataque: { label: "Ataque", borderClass: "border-t-success" },
  definicion: { label: "Definición", borderClass: "border-t-secondary" },
  defensa: { label: "Defensa", borderClass: "border-t-primary" },
  especial: { label: "Especial", borderClass: "border-t-warning" },
  disciplina: { label: "Disciplina", borderClass: "border-t-destructive" },
  general: { label: "General", borderClass: "border-t-muted-foreground" },
};

const CATEGORY_ORDER: CategoryKind[] = [
  "ataque",
  "definicion",
  "defensa",
  "especial",
  "disciplina",
  "general",
];

const FUTBOL: Record<string, CategoryKind> = {
  goals: "ataque",
  assists: "ataque",
  shots_total: "ataque",
  shots_on_target: "ataque",
  key_passes: "ataque",
  pass_accuracy_pct: "ataque",
  corners_taken: "ataque",
  tackles_won: "defensa",
  interceptions: "defensa",
  saves: "defensa",
  goals_conceded: "defensa",
  clean_sheet: "defensa",
  fouls_committed: "disciplina",
  fouls_received: "disciplina",
  offsides: "disciplina",
  yellow_cards: "disciplina",
  red_cards: "disciplina",
  accumulated_fouls: "disciplina",
  double_penalties: "disciplina",
  minutes_played: "general",
};

const HOCKEY: Record<string, CategoryKind> = {
  goals: "ataque",
  assists: "ataque",
  shots_on_target: "ataque",
  circle_entries: "ataque",
  penalty_corners_earned: "especial",
  penalty_corners_converted: "especial",
  tackles_won: "defensa",
  saves: "defensa",
  goals_conceded: "defensa",
  green_cards: "disciplina",
  yellow_cards: "disciplina",
  red_cards: "disciplina",
  minutes_played: "general",
};

const VOLEY: Record<string, CategoryKind> = {
  attack_attempts: "ataque",
  kills: "ataque",
  attack_errors: "ataque",
  service_attempts: "definicion",
  aces: "definicion",
  service_errors: "definicion",
  blocks_solo: "especial",
  blocks_assist: "especial",
  block_errors: "especial",
  set_assists: "especial",
  digs: "defensa",
  reception_attempts: "defensa",
  reception_errors: "defensa",
  reception_positive_pct: "defensa",
  sets_played: "general",
};

const RUGBY: Record<string, CategoryKind> = {
  tries: "ataque",
  carries: "ataque",
  meters_gained: "ataque",
  offloads: "ataque",
  conversions: "definicion",
  penalty_goals: "definicion",
  drop_goals: "definicion",
  tackles_made: "defensa",
  tackles_missed: "defensa",
  turnovers_won: "defensa",
  turnovers_conceded: "defensa",
  lineouts_won: "especial",
  scrums_won: "especial",
  yellow_cards: "disciplina",
  red_cards: "disciplina",
  minutes_played: "general",
};

const BASQUET: Record<string, CategoryKind> = {
  points: "ataque",
  fg_made: "ataque",
  fg_attempted: "ataque",
  three_made: "ataque",
  three_attempted: "ataque",
  ft_made: "ataque",
  ft_attempted: "ataque",
  one_point_made: "ataque",
  one_point_attempted: "ataque",
  two_point_made: "ataque",
  two_point_attempted: "ataque",
  assists: "definicion",
  turnovers: "definicion",
  rebounds_off: "defensa",
  rebounds_def: "defensa",
  rebounds: "defensa",
  steals: "defensa",
  blocks: "defensa",
  fouls: "disciplina",
  minutes_played: "general",
};

const CATEGORY_MAPS: Record<string, Record<string, CategoryKind>> = {
  futbol: FUTBOL,
  hockey: HOCKEY,
  voley: VOLEY,
  rugby: RUGBY,
  basquetbol: BASQUET,
};

const ACCENTS: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n" };

function resolveSportKey(sportName: string): string | null {
  const normalized = sportName
    .trim()
    .toLowerCase()
    .replace(/[áéíóúñ]/g, (char) => ACCENTS[char] ?? char);

  if (normalized.includes("futbol")) return "futbol";
  if (normalized.includes("voley")) return "voley";
  if (normalized.includes("hockey")) return "hockey";
  if (normalized.includes("basquet")) return "basquetbol";
  if (normalized.includes("rugby")) return "rugby";
  return null;
}

export type StatCategoryGroup = {
  kind: CategoryKind;
  label: string;
  borderClass: string;
  fields: StatField[];
};

export function categorizeStatFields(
  sportName: string | null | undefined,
  statFields: StatField[],
): StatCategoryGroup[] {
  const key = sportName ? resolveSportKey(sportName) : null;
  const map = key ? CATEGORY_MAPS[key] : undefined;
  const sorted = sortStatFields(statFields);

  const groups = new Map<CategoryKind, StatField[]>();
  for (const field of sorted) {
    const kind = map?.[field.key] ?? "general";
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind)!.push(field);
  }

  return CATEGORY_ORDER.filter((kind) => groups.has(kind)).map((kind) => ({
    kind,
    label: CATEGORY_STYLES[kind].label,
    borderClass: CATEGORY_STYLES[kind].borderClass,
    fields: groups.get(kind)!,
  }));
}

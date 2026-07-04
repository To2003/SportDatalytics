export type AttributeStat = { key: string; weight: number };

export type Attribute = {
  key: string;
  label: string;
  stats: AttributeStat[];
  max: number;
  // Atributo "cuanto menos, mejor" (ej. disciplina = menos tarjetas/faltas).
  invert?: boolean;
};

// Pesos y "max" son heurísticos (no hay data histórica todavía para calibrarlos
// contra un promedio real) — sirven para que el pentágono tenga forma razonable
// desde el día uno. Fáciles de retocar acá sin tocar el resto del código.
const FUTBOL: Attribute[] = [
  { key: "ataque", label: "Ataque", stats: [{ key: "goals", weight: 6 }, { key: "assists", weight: 4 }, { key: "shots_on_target", weight: 1 }], max: 60 },
  { key: "creacion", label: "Creación", stats: [{ key: "key_passes", weight: 3 }, { key: "pass_accuracy_pct", weight: 0.6 }], max: 60 },
  { key: "defensa", label: "Defensa", stats: [{ key: "tackles_won", weight: 3 }, { key: "interceptions", weight: 3 }], max: 60 },
  { key: "disciplina", label: "Disciplina", stats: [{ key: "fouls_committed", weight: 3 }, { key: "yellow_cards", weight: 10 }, { key: "red_cards", weight: 30 }], max: 100, invert: true },
  { key: "resistencia", label: "Resistencia", stats: [{ key: "minutes_played", weight: 1 }], max: 900 },
];

const HOCKEY: Attribute[] = [
  { key: "ataque", label: "Ataque", stats: [{ key: "goals", weight: 5 }, { key: "assists", weight: 3 }, { key: "shots_on_target", weight: 1 }], max: 50 },
  { key: "creacion", label: "Creación", stats: [{ key: "circle_entries", weight: 2 }], max: 40 },
  { key: "corners", label: "Córners", stats: [{ key: "penalty_corners_earned", weight: 2 }, { key: "penalty_corners_converted", weight: 5 }], max: 40 },
  { key: "defensa", label: "Defensa", stats: [{ key: "tackles_won", weight: 3 }], max: 30 },
  { key: "disciplina", label: "Disciplina", stats: [{ key: "yellow_cards", weight: 10 }, { key: "green_cards", weight: 5 }, { key: "red_cards", weight: 30 }], max: 100, invert: true },
];

const VOLEY: Attribute[] = [
  { key: "ataque", label: "Ataque", stats: [{ key: "kills", weight: 3 }, { key: "attack_errors", weight: -1 }], max: 90 },
  { key: "saque", label: "Saque", stats: [{ key: "aces", weight: 4 }, { key: "service_errors", weight: -1 }], max: 40 },
  { key: "bloqueo", label: "Bloqueo", stats: [{ key: "blocks_solo", weight: 3 }, { key: "blocks_assist", weight: 1.5 }, { key: "block_errors", weight: -1 }], max: 40 },
  { key: "recepcion", label: "Recepción/Defensa", stats: [{ key: "digs", weight: 1 }, { key: "reception_positive_pct", weight: 0.5 }, { key: "reception_errors", weight: -1 }], max: 60 },
  { key: "armado", label: "Armado", stats: [{ key: "set_assists", weight: 1 }], max: 40 },
  { key: "participacion", label: "Participación", stats: [{ key: "sets_played", weight: 1 }], max: 25 },
];

const RUGBY: Attribute[] = [
  { key: "ataque", label: "Ataque", stats: [{ key: "tries", weight: 6 }, { key: "meters_gained", weight: 0.1 }, { key: "carries", weight: 0.5 }], max: 80 },
  { key: "definicion", label: "Definición", stats: [{ key: "conversions", weight: 2 }, { key: "penalty_goals", weight: 3 }, { key: "drop_goals", weight: 4 }], max: 40 },
  { key: "defensa", label: "Defensa", stats: [{ key: "tackles_made", weight: 1 }, { key: "tackles_missed", weight: -1 }], max: 60 },
  { key: "contacto", label: "Contacto", stats: [{ key: "offloads", weight: 2 }, { key: "turnovers_won", weight: 2 }, { key: "turnovers_conceded", weight: -1 }], max: 40 },
  { key: "set_piece", label: "Set piece", stats: [{ key: "lineouts_won", weight: 2 }, { key: "scrums_won", weight: 2 }], max: 40 },
  { key: "disciplina", label: "Disciplina", stats: [{ key: "yellow_cards", weight: 10 }, { key: "red_cards", weight: 30 }], max: 100, invert: true },
];

const BASQUET: Attribute[] = [
  { key: "anotacion", label: "Anotación", stats: [{ key: "points", weight: 1 }], max: 300 },
  { key: "tiro_exterior", label: "Tiro exterior", stats: [{ key: "three_made", weight: 3 }], max: 30 },
  // "rebounds" cubre la variante 3x3 (usa un solo total en vez de of/def separados).
  { key: "rebote", label: "Rebote", stats: [{ key: "rebounds_off", weight: 1 }, { key: "rebounds_def", weight: 1 }, { key: "rebounds", weight: 1 }], max: 100 },
  { key: "playmaking", label: "Playmaking", stats: [{ key: "assists", weight: 2 }, { key: "turnovers", weight: -1 }], max: 60 },
  { key: "defensa", label: "Defensa", stats: [{ key: "steals", weight: 2 }, { key: "blocks", weight: 2 }], max: 40 },
  { key: "disciplina", label: "Disciplina", stats: [{ key: "fouls", weight: 10 }], max: 100, invert: true },
];

const ATTRIBUTE_MAPS: Record<string, Attribute[]> = {
  futbol: FUTBOL,
  hockey: HOCKEY,
  voley: VOLEY,
  rugby: RUGBY,
  basquetbol: BASQUET,
};

function resolveSportKey(sportName: string): string | null {
  const normalized = sportName
    .trim()
    .toLowerCase()
    .replace(/[áéíóúñ]/g, (char) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u", ñ: "n" })[char] ?? char);

  if (normalized.includes("futbol")) return "futbol";
  if (normalized.includes("voley")) return "voley";
  if (normalized.includes("hockey")) return "hockey";
  if (normalized.includes("basquet")) return "basquetbol";
  if (normalized.includes("rugby")) return "rugby";
  return null;
}

export function attributesForSport(sportName?: string | null): Attribute[] {
  if (!sportName) return [];
  const key = resolveSportKey(sportName);
  return key ? ATTRIBUTE_MAPS[key] : [];
}

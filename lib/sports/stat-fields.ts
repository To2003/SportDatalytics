export type StatFieldType = "integer" | "decimal" | "boolean" | "percentage";

export type StatField = {
  key: string;
  label: string;
  type: StatFieldType;
  unit: string | null;
  min: number | null;
  max: number | null;
  order: number;
};

export type SportConfig = {
  id: string;
  name: string;
  positions: string[];
  statFields: StatField[];
};

export function sortStatFields(fields: StatField[]): StatField[] {
  return [...fields].sort((a, b) => a.order - b.order);
}

export function defaultStatValue(field: StatField): number | boolean {
  return field.type === "boolean" ? false : 0;
}

export function emptyStatsForSport(sport: Pick<SportConfig, "statFields">): Record<string, number | boolean> {
  return Object.fromEntries(
    sortStatFields(sport.statFields).map((field) => [field.key, defaultStatValue(field)]),
  );
}

export function validateStatValue(field: StatField, value: unknown): string | null {
  if (field.type === "boolean") {
    return typeof value === "boolean" ? null : `${field.label} debe ser verdadero/falso`;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    return `${field.label} debe ser un número`;
  }
  if (field.type === "integer" && !Number.isInteger(value)) {
    return `${field.label} debe ser un número entero`;
  }
  if (field.min !== null && value < field.min) {
    return `${field.label} no puede ser menor a ${field.min}`;
  }
  if (field.max !== null && value > field.max) {
    return `${field.label} no puede ser mayor a ${field.max}`;
  }
  return null;
}

export function validateStats(
  fields: StatField[],
  stats: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const error = validateStatValue(field, stats[field.key]);
    if (error) errors[field.key] = error;
  }
  return errors;
}

export type SportVariant = {
  key: string;
  label: string;
  team_size: number;
  notes?: string;
  extra_stats?: StatField[];
  disabled_stats?: string[];
};

// Un equipo elige una variante fija de su deporte (ej. "Fútbol 11" vs "Futsal").
// Esto calcula la lista real de stats a mostrar: la base del deporte, menos las
// que la variante desactiva (no aplican, ej. offside en fútbol 5), más las que
// la variante suma (ej. "faltas acumuladas" en futsal).
export function effectiveStatFields(
  baseFields: StatField[],
  variants: SportVariant[],
  variantKey?: string | null,
): StatField[] {
  const variant = variantKey ? variants.find((v) => v.key === variantKey) : undefined;
  if (!variant) return sortStatFields(baseFields);

  const disabled = new Set(variant.disabled_stats ?? []);
  const kept = baseFields.filter((field) => !disabled.has(field.key));
  return sortStatFields([...kept, ...(variant.extra_stats ?? [])]);
}

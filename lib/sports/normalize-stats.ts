import type { StatField } from "@/lib/sports/stat-fields";
import { attributesForSport } from "@/lib/sports/attribute-maps";

export type RadarPoint = { attribute: string; value: number; fullMark: 100 };

// Conteos (integer/boolean) se suman a lo largo de todos los partidos; los
// campos decimal/percentage (ej. % de precisión de pase) se promedian —
// sumarlos no tendría sentido dimensional.
export function aggregatePlayerStats(
  statFields: StatField[],
  matchStatsList: Record<string, number | boolean>[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const field of statFields) {
    const values = matchStatsList.map((stats) => {
      const value = stats[field.key];
      if (typeof value === "boolean") return value ? 1 : 0;
      return typeof value === "number" ? value : 0;
    });

    if (values.length === 0) {
      totals[field.key] = 0;
      continue;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const isRate = field.type === "decimal" || field.type === "percentage";
    totals[field.key] = isRate ? sum / values.length : sum;
  }

  return totals;
}

export function normalizePlayerStats(
  sportName: string | null | undefined,
  aggregated: Record<string, number>,
): RadarPoint[] {
  const attributes = attributesForSport(sportName);

  return attributes.map((attribute) => {
    const raw = attribute.stats.reduce(
      (sum, stat) => sum + (aggregated[stat.key] ?? 0) * stat.weight,
      0,
    );
    let pct = attribute.max > 0 ? (raw / attribute.max) * 100 : 0;
    if (attribute.invert) pct = 100 - pct;
    pct = Math.max(0, Math.min(100, Math.round(pct)));

    return { attribute: attribute.label, value: pct, fullMark: 100 };
  });
}

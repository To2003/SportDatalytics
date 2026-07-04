"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { RadarPoint } from "@/lib/sports/normalize-stats";

// Colores hardcodeados (no var(--primary)): el soporte de custom properties
// dentro de atributos SVG que pasa Recharts no es consistente entre navegadores.
const ACCENT = "#22d3ee"; // cyan-400 (primary)
const GRID = "#334155"; // slate-700 (border) — grilla recesiva
const LABEL = "#94a3b8"; // slate-400 (muted-foreground) — el texto nunca lleva el color de la serie

export default function PlayerRadarChart({ data }: { data: RadarPoint[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="attribute" tick={{ fill: LABEL, fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke={ACCENT}
            strokeWidth={2}
            fill={ACCENT}
            fillOpacity={0.1}
            dot={{ r: 4, fill: ACCENT, stroke: "none" }}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

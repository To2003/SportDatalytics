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
        <RadarChart data={data} outerRadius="65%">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.08} />
            </radialGradient>
          </defs>
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="attribute" tick={{ fill: LABEL, fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke={ACCENT}
            strokeWidth={2.5}
            fill="url(#radarFill)"
            dot={{ r: 4, fill: ACCENT, stroke: "#020617", strokeWidth: 2 }}
            isAnimationActive={false}
            label={{ fill: ACCENT, fontSize: 12, fontWeight: 700 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

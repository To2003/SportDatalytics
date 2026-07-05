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
const BG = "#020617"; // background — fondo del chip del número, para que se lea sobre grilla o relleno

// Dibuja el punto y, pegado a él, un chip con el valor empujado hacia afuera
// del centro (según el vector centro→punto): así el número queda siempre
// legible, sin importar si el vértice cae sobre la grilla o el relleno.
function ValueDot({ cx, cy, x, y, value }: {
  cx?: number | string;
  cy?: number | string;
  x?: number | string;
  y?: number | string;
  value?: number;
}) {
  const px = Number(x) || 0;
  const py = Number(y) || 0;
  const pcx = Number(cx) || 0;
  const pcy = Number(cy) || 0;
  const dx = px - pcx;
  const dy = py - pcy;
  const dist = Math.hypot(dx, dy) || 1;
  const offset = 18;
  const lx = px + (dx / dist) * offset;
  const ly = py + (dy / dist) * offset;
  const text = String(Math.round(value ?? 0));
  const pillWidth = 16 + text.length * 7;

  return (
    <g>
      <circle cx={px} cy={py} r={4.5} fill={ACCENT} stroke={BG} strokeWidth={2} />
      <rect
        x={lx - pillWidth / 2}
        y={ly - 10}
        width={pillWidth}
        height={20}
        rx={6}
        fill={BG}
        fillOpacity={0.85}
      />
      <text x={lx} y={ly} dy={4} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>
        {text}
      </text>
    </g>
  );
}

export default function PlayerRadarChart({ data }: { data: RadarPoint[] }) {
  if (data.length === 0) return null;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.08} />
            </radialGradient>
          </defs>
          <PolarGrid stroke={GRID} />
          <PolarAngleAxis dataKey="attribute" tick={{ fill: LABEL, fontSize: 13, fontWeight: 600 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke={ACCENT}
            strokeWidth={2.5}
            fill="url(#radarFill)"
            dot={(dotProps) => <ValueDot key={dotProps.index} {...dotProps} />}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

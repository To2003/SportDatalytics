const PALETTE = [
  { bg: "bg-cyan-500", text: "text-slate-950" },
  { bg: "bg-orange-500", text: "text-slate-950" },
  { bg: "bg-green-500", text: "text-slate-950" },
  { bg: "bg-red-500", text: "text-white" },
  { bg: "bg-yellow-500", text: "text-slate-950" },
  { bg: "bg-purple-500", text: "text-white" },
];

export function hashColor(seed: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

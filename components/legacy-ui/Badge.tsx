import type { HTMLAttributes } from "react";

type Tone = "brand" | "accent" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800",
  accent: "bg-accent-300/40 text-accent-700",
  neutral: "bg-zinc-100 text-zinc-600",
};

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

export default function Badge({ tone = "neutral", className = "", ...props }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
      {...props}
    />
  );
}

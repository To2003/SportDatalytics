import { Goal, Volleyball, Disc, CircleDot, Swords, Trophy } from "lucide-react";

const SPORT_ICONS = {
  futbol: Goal,
  voley: Volleyball,
  hockey: Disc,
  basquet: CircleDot,
  rugby: Swords,
};

const ACCENTS: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ñ: "n",
};

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[áéíóúñ]/g, (char) => ACCENTS[char]);
}

export function sportIcon(sportName?: string | null, className = "h-5 w-5") {
  const Icon = (sportName && SPORT_ICONS[normalize(sportName) as keyof typeof SPORT_ICONS]) || Trophy;
  return <Icon className={className} />;
}

type PersonalIdentity =
  | {
      first_name?: string | null;
      last_name?: string | null;
      nickname?: string | null;
    }
  | null
  | undefined;

// Prioridad: apodo del equipo (pisa todo) > apodo personal default >
// Nombre Apellido > placeholder para perfiles que todavía no completaron nada.
export function displayName(personal: PersonalIdentity, teamNickname?: string | null): string {
  const nickname = teamNickname?.trim() || personal?.nickname?.trim();
  if (nickname) return nickname;

  const fullName = [personal?.first_name, personal?.last_name].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;

  return "Sin nombre";
}

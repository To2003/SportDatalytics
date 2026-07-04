"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubmitButton from "@/components/SubmitButton";

export default function ChangeRoleForm({
  action,
  currentRole,
}: {
  action: (formData: FormData) => void;
  currentRole: string;
}) {
  const [role, setRole] = useState(currentRole === "coach" ? "coach" : "player");

  return (
    <form action={action} className="flex items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <Select name="role" value={role} onValueChange={(v) => setRole(v ?? "player")}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {(value: string) => (value === "coach" ? "Entrenador" : "Jugador")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Jugador</SelectItem>
            <SelectItem value="coach">Entrenador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SubmitButton size="sm" pendingLabel="Guardando...">
        Guardar
      </SubmitButton>
    </form>
  );
}

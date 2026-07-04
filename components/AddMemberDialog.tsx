"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubmitButton from "@/components/SubmitButton";

export default function AddMemberDialog({
  action,
  error,
}: {
  action: (formData: FormData) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(Boolean(error));
  const [role, setRole] = useState("player");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            Agregar miembro
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar miembro</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="member-email">
              Email del usuario (ya debe tener cuenta creada)
            </Label>
            <Input id="member-email" name="email" type="email" required placeholder="jugador@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Rol</Label>
            <Select name="role" value={role} onValueChange={(v) => setRole(v ?? "player")}>
              <SelectTrigger className="w-full">
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
          <SubmitButton pendingLabel="Agregando...">Agregar</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

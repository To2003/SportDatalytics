"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import TeamSportSelect from "@/components/TeamSportSelect";
import SubmitButton from "@/components/SubmitButton";

type SportOption = {
  id: string;
  name: string;
  variants: { key: string; label: string }[];
};

export default function EditTeamDialog({
  action,
  deleteAction,
  sports,
  team,
  error,
}: {
  action: (formData: FormData) => void;
  deleteAction: (formData: FormData) => void;
  sports: SportOption[];
  team: {
    name: string;
    description: string | null;
    sport_id: string;
    variant_key: string | null;
  };
  error?: string;
}) {
  const [open, setOpen] = useState(Boolean(error));
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar equipo</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-team-name">Nombre</Label>
            <Input id="edit-team-name" name="name" required defaultValue={team.name} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-team-description">Descripción</Label>
            <Input
              id="edit-team-description"
              name="description"
              defaultValue={team.description ?? ""}
            />
          </div>
          <TeamSportSelect
            sports={sports}
            defaultSportId={team.sport_id}
            defaultVariantKey={team.variant_key}
          />
          <SubmitButton pendingLabel="Guardando...">Guardar cambios</SubmitButton>
        </form>

        <div className="border-t border-border pt-4 flex flex-col gap-3">
          <p className="text-xs font-heading font-semibold uppercase tracking-wide text-destructive">
            Zona de peligro
          </p>
          <p className="text-xs text-muted-foreground">
            Se borran para siempre todos sus miembros, partidos y estadísticas cargadas. No se
            puede deshacer.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-team-name">
              Escribí <span className="font-semibold text-foreground">{team.name}</span> para
              confirmar
            </Label>
            <Input
              id="confirm-team-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>
          <form action={deleteAction} className="self-start">
            <SubmitButton
              variant="destructive"
              size="sm"
              pendingLabel="Eliminando..."
              disabled={confirmText !== team.name}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar equipo
            </SubmitButton>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

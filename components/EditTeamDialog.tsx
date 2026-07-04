"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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
  sports,
  team,
  error,
}: {
  action: (formData: FormData) => void;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

export default function CreateTeamDialog({
  action,
  sports,
  error,
}: {
  action: (formData: FormData) => void;
  sports: SportOption[];
  error?: string;
}) {
  const [open, setOpen] = useState(Boolean(error));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="h-4 w-4" />
            Crear equipo
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear equipo</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name">Nombre</Label>
            <Input id="team-name" name="name" required placeholder="Los Tigres" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-description">Descripción</Label>
            <Input
              id="team-description"
              name="description"
              placeholder="Categoría, liga, lo que quieras"
            />
          </div>
          <TeamSportSelect sports={sports} />
          <SubmitButton pendingLabel="Creando...">Crear equipo</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

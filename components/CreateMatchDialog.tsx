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
import SubmitButton from "@/components/SubmitButton";

export default function CreateMatchDialog({
  action,
  error,
}: {
  action: (formData: FormData) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(Boolean(error));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nuevo partido
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo partido</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="opponent">Rival</Label>
            <Input id="opponent" name="opponent" required placeholder="Club Atlético..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="match_date">Fecha y hora</Label>
            <Input id="match_date" name="match_date" type="datetime-local" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Lugar</Label>
            <Input id="location" name="location" placeholder="Cancha principal" />
          </div>
          <SubmitButton pendingLabel="Creando...">Crear partido</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

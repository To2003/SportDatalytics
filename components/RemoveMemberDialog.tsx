"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubmitButton from "@/components/SubmitButton";

export default function RemoveMemberDialog({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar del equipo
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar del equipo?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Se pierden su posición, número de camiseta, convocatorias y estadísticas cargadas en
          este equipo. No se puede deshacer.
        </p>
        <form action={action} className="flex justify-end gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <SubmitButton variant="destructive" pendingLabel="Eliminando...">
            Eliminar
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SubmitButton from "@/components/SubmitButton";

export default function DeleteTeamDialog({
  action,
  teamName,
}: {
  action: (formData: FormData) => void;
  teamName: string;
}) {
  const [open, setOpen] = useState(false);
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
          <Button variant="destructive" size="sm">
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar equipo
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar &quot;{teamName}&quot;?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Se borran para siempre todos sus miembros, partidos y estadísticas cargadas. No se
          puede deshacer.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-team-name">
            Escribí <span className="font-semibold text-foreground">{teamName}</span> para
            confirmar
          </Label>
          <Input
            id="confirm-team-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>
        <form action={action} className="flex justify-end gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <SubmitButton
            variant="destructive"
            pendingLabel="Eliminando..."
            disabled={confirmText !== teamName}
          >
            Eliminar
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

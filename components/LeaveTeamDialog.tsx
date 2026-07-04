"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
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

export default function LeaveTeamDialog({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <LogOut className="h-3.5 w-3.5" />
            Abandonar equipo
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Abandonar el equipo?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Vas a perder el acceso a este equipo. Para volver a sumarte vas a necesitar un código de
          invitación nuevo.
        </p>
        <form action={action} className="flex justify-end gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <SubmitButton variant="destructive" pendingLabel="Saliendo...">
            Abandonar
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

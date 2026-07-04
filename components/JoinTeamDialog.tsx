"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
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

export default function JoinTeamDialog({
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
          <Button variant="outline">
            <KeyRound className="h-4 w-4" />
            Unirme
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unirme a un equipo</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-code">Código de invitación</Label>
            <Input
              id="invite-code"
              name="invite_code"
              required
              maxLength={6}
              placeholder="AB12CD"
              className="uppercase tracking-widest"
            />
          </div>
          <SubmitButton pendingLabel="Uniéndome...">Unirme</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

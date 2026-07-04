"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
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

type MatchStatus = "scheduled" | "live" | "finished";

type Set = { home: number; away: number };

export default function UpdateMatchResultDialog({
  action,
  status,
  scoreHome,
  scoreAway,
  sets,
  showSets,
  error,
}: {
  action: (formData: FormData) => void;
  status: MatchStatus;
  scoreHome: number | null;
  scoreAway: number | null;
  sets: Set[];
  showSets: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(Boolean(error));
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>(status);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Trophy className="h-3.5 w-3.5" />
            Actualizar resultado
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar resultado</DialogTitle>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select
              name="status"
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus((v as MatchStatus) ?? "scheduled")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: MatchStatus) =>
                    ({ scheduled: "Próximo", live: "En vivo", finished: "Finalizado" })[value]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Próximo</SelectItem>
                <SelectItem value="live">En vivo</SelectItem>
                <SelectItem value="finished">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="score_home">Nuestro resultado</Label>
              <Input
                id="score_home"
                name="score_home"
                type="number"
                min={0}
                defaultValue={scoreHome ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="score_away">Resultado rival</Label>
              <Input
                id="score_away"
                name="score_away"
                type="number"
                min={0}
                defaultValue={scoreAway ?? ""}
              />
            </div>
          </div>

          {showSets && (
            <div className="flex flex-col gap-2">
              <Label>Sets (opcional)</Label>
              {[1, 2, 3, 4, 5].map((n) => {
                const set = sets[n - 1];
                return (
                  <div key={n} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">Set {n}</span>
                    <Input
                      name={`set_home_${n}`}
                      type="number"
                      min={0}
                      placeholder="—"
                      defaultValue={set?.home ?? ""}
                    />
                    <Input
                      name={`set_away_${n}`}
                      type="number"
                      min={0}
                      placeholder="—"
                      defaultValue={set?.away ?? ""}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <SubmitButton pendingLabel="Guardando...">Guardar</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

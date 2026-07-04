"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { StatField } from "@/lib/sports/stat-fields";
import { categorizeStatFields } from "@/lib/sports/stat-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/SubmitButton";

type Props = {
  statFields: StatField[];
  initialValues: Record<string, number | boolean>;
  action: (formData: FormData) => void;
  sportName?: string | null;
  submitLabel?: string;
};

function clampToField(field: StatField, value: number) {
  let next = value;
  if (field.min != null) next = Math.max(field.min, next);
  if (field.max != null) next = Math.min(field.max, next);
  return field.type === "decimal" ? Math.round(next * 10) / 10 : Math.round(next);
}

// Stepper (-/+) en vez de tipear en un input numérico: mucho más rápido de
// tocar desde el celular mientras se sigue el partido en vivo.
function StatStepperField({ field, defaultValue }: { field: StatField; defaultValue: number }) {
  const step = field.type === "decimal" ? 0.1 : 1;
  const [value, setValue] = useState(() => clampToField(field, defaultValue));

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setValue((v) => clampToField(field, v - step))}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        id={field.key}
        type="number"
        name={field.key}
        step={step}
        min={field.min ?? undefined}
        max={field.max ?? undefined}
        value={value}
        onChange={(e) => setValue(clampToField(field, Number(e.target.value) || 0))}
        className="w-14 text-center px-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setValue((v) => clampToField(field, v + step))}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export default function DynamicStatForm({
  statFields,
  initialValues,
  action,
  sportName,
  submitLabel = "Guardar stats",
}: Props) {
  const groups = categorizeStatFields(sportName, statFields);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input
        type="hidden"
        name="__field_defs"
        value={JSON.stringify(statFields.map((f) => ({ key: f.key, type: f.type })))}
      />
      {groups.map((group) => (
        <div key={group.kind} className={`border-t-4 ${group.borderClass} rounded-lg bg-muted/40 p-3`}>
          <p className="text-xs font-heading font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            {group.label}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.fields.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-2">
                <Label htmlFor={field.key} className="text-xs font-normal truncate">
                  {field.label}
                  {field.unit ? ` (${field.unit})` : ""}
                </Label>
                {field.type === "boolean" ? (
                  <input
                    id={field.key}
                    type="checkbox"
                    name={field.key}
                    defaultChecked={Boolean(initialValues[field.key])}
                    className="h-5 w-5 accent-primary shrink-0"
                  />
                ) : (
                  <StatStepperField field={field} defaultValue={Number(initialValues[field.key] ?? 0)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <SubmitButton size="sm" className="self-start" pendingLabel="Guardando...">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

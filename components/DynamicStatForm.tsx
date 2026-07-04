import type { StatField } from "@/lib/sports/stat-fields";
import { categorizeStatFields } from "@/lib/sports/stat-categories";
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
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
                    className="h-5 w-5 accent-primary"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type="number"
                    name={field.key}
                    step={field.type === "decimal" ? "0.1" : "1"}
                    min={field.min ?? undefined}
                    max={field.max ?? undefined}
                    defaultValue={Number(initialValues[field.key] ?? 0)}
                  />
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

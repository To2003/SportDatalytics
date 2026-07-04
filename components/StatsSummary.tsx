import { sortStatFields, type StatField } from "@/lib/sports/stat-fields";

type Props = {
  statFields: StatField[];
  values: Record<string, number | boolean>;
};

export default function StatsSummary({ statFields, values }: Props) {
  const fields = sortStatFields(statFields);

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {fields.map((field) => (
        <li key={field.key} className="rounded-lg bg-muted p-2">
          <p className="text-lg font-bold text-primary leading-none">
            {typeof values[field.key] === "boolean"
              ? values[field.key]
                ? "Sí"
                : "No"
              : String(values[field.key] ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {field.label}
            {field.unit ? ` (${field.unit})` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

import { Badge } from "@/components/ui/badge";

type MatchStatus = "scheduled" | "live" | "finished";

export default function MatchStatusBadge({ status }: { status: MatchStatus }) {
  if (status === "live") {
    return (
      <Badge variant="destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        En vivo
      </Badge>
    );
  }

  if (status === "finished") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Finalizado
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-primary/40 text-primary">
      Próximo
    </Badge>
  );
}

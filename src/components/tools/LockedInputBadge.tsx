import { Badge } from "@/components/ui/badge";

interface LockedInputBadgeProps {
  label: string;
  value: string;
}

export function LockedInputBadge({ label, value }: LockedInputBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );
}

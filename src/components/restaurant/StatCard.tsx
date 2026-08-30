import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: React.ElementType;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-strong">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-xl font-extrabold text-foreground lg:text-2xl">{value}</p>
      {delta !== undefined && (
        <p
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs font-semibold",
            positive ? "text-success" : "text-destructive",
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(delta).toFixed(1)}% vs. período anterior
        </p>
      )}
    </div>
  );
}

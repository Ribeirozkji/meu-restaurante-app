import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export const orderStatusLabel: Record<OrderStatus, string> = {
  novo: "Pedido recebido",
  preparacao: "Em preparação",
  entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

const styles: Record<OrderStatus, string> = {
  novo: "bg-primary-soft text-primary-strong",
  preparacao: "bg-warning/25 text-warning-foreground",
  entrega: "bg-primary/15 text-primary-strong",
  entregue: "bg-success/15 text-success",
  cancelado: "bg-destructive/12 text-destructive",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      {orderStatusLabel[status]}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
  className?: string;
}) {
  const tones = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/25 text-warning-foreground",
    danger: "bg-destructive/12 text-destructive",
    brand: "bg-primary-soft text-primary-strong",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

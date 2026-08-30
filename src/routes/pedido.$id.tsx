import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChefHat, Bike, PackageCheck } from "lucide-react";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { currency, formatDate, formatTime } from "@/utils/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Pedido realizado — Sabor da Casa" },
      {
        name: "description",
        content: "Acompanhe o status do seu pedido, código, valor e endereço de entrega.",
      },
      { property: "og:title", content: "Acompanhe seu pedido — Sabor da Casa" },
      { property: "og:description", content: "Status em tempo real do seu pedido." },
    ],
  }),
  component: PedidoDetalhe,
});

const paymentLabel = { pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão" } as const;

const steps: Array<{ status: OrderStatus; label: string; icon: typeof ChefHat }> = [
  { status: "novo", label: "Pedido recebido", icon: CheckCircle2 },
  { status: "preparacao", label: "Em preparação", icon: ChefHat },
  { status: "entrega", label: "Saiu para entrega", icon: Bike },
  { status: "entregue", label: "Entregue", icon: PackageCheck },
];

function PedidoDetalhe() {
  const { id } = Route.useParams();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <ClientLayout>
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
          <Link to="/historico" className="mt-3 inline-block font-semibold text-primary">
            Ver meus pedidos
          </Link>
        </div>
      </ClientLayout>
    );
  }

  const currentIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <ClientLayout>
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card-surface p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-3 text-2xl font-extrabold text-foreground">Pedido realizado!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu pedido foi enviado para o restaurante.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Código do pedido
          </p>
          <p className="text-xl font-extrabold text-primary">{order.code}</p>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Acompanhar pedido</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => {
              const done = order.status !== "cancelado" && index <= currentIndex;
              return (
                <li key={step.status} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <step.icon className="h-4.5 w-4.5" />
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
          {order.status === "cancelado" && (
            <p className="mt-3 text-sm font-semibold text-destructive">
              Este pedido foi cancelado.
            </p>
          )}
        </div>

        <div className="card-surface divide-y divide-border p-5 text-sm">
          <Info label="Data" value={formatDate(order.createdAt)} />
          <Info label="Horário" value={formatTime(order.createdAt)} />
          <Info label="Valor" value={currency(order.total)} />
          <Info label="Forma de pagamento" value={paymentLabel[order.payment]} />
          <Info label="Endereço" value={order.address} />
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Itens</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.quantity} × {item.name}
                </span>
                <span className="font-semibold">{currency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{currency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Entrega</span>
              <span>{currency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-foreground">
              <span>Total</span>
              <span>{currency(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/historico"
            className="flex-1 rounded-xl border border-border bg-card py-3 text-center text-sm font-bold text-foreground"
          >
            Meus pedidos
          </Link>
          <Link
            to="/cardapio"
            className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
          >
            Pedir novamente
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { useApp } from "@/store/app-store";
import { currency, formatDate, formatTime } from "@/utils/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { OrderReceipt } from "@/components/restaurant/OrderReceipt";
import type { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/restaurante/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — Painel Sabor da Casa" },
      {
        name: "description",
        content: "Acompanhe e gerencie todos os pedidos do restaurante por status.",
      },
      { property: "og:title", content: "Pedidos — Painel Sabor da Casa" },
      { property: "og:description", content: "Gestão completa dos pedidos recebidos." },
    ],
  }),
  component: PedidosRestaurante,
});

const filters: Array<{ id: OrderStatus | "todos"; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "novo", label: "Novos" },
  { id: "preparacao", label: "Em preparação" },
  { id: "entrega", label: "Saiu para entrega" },
  { id: "entregue", label: "Entregues" },
  { id: "cancelado", label: "Cancelados" },
];

const paymentLabel = { pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão" } as const;

function PedidosRestaurante() {
  const { orders } = useApp();
  const [filter, setFilter] = useState<OrderStatus | "todos">("todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = orders.filter((order) => {
    const matchStatus = filter === "todos" || order.status === filter;
    const matchQuery = `${order.code} ${order.customerName} ${order.district}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <RestaurantLayout title="Pedidos" subtitle={`${filtered.length} pedido(s) listado(s)`}>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {filters.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold",
                filter === option.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 lg:ml-auto lg:w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar código ou cliente"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="card-surface hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Código", "Cliente", "Horário", "Produtos", "Total", "Pagamento", "Endereço", "Status"].map(
                (header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelected(order)}
                className="cursor-pointer transition-colors hover:bg-muted/60"
              >
                <td className="px-4 py-3 font-semibold text-foreground">{order.code}</td>
                <td className="px-4 py-3">{order.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(order.createdAt)} {formatTime(order.createdAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} itens
                </td>
                <td className="px-4 py-3 font-bold">{currency(order.total)}</td>
                <td className="px-4 py-3">{paymentLabel[order.payment]}</td>
                <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                  {order.address}
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {filtered.map((order) => (
          <button
            key={order.id}
            onClick={() => setSelected(order)}
            className="card-surface w-full p-4 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground">{order.code}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customerName} · {formatTime(order.createdAt)}
            </p>
            <p className="text-xs text-muted-foreground">{order.address}</p>
            <p className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{paymentLabel[order.payment]}</span>
              <span className="font-extrabold text-foreground">{currency(order.total)}</span>
            </p>
          </button>
        ))}
      </div>

      {selected && <OrderReceipt order={selected} onClose={() => setSelected(null)} />}
    </RestaurantLayout>
  );
}

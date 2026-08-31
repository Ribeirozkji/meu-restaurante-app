import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { useApp } from "@/store/app-store";
import { currency, formatDate } from "@/utils/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import type { Customer } from "@/types";

export const Route = createFileRoute("/restaurante/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Painel Sabor da Casa" },
      {
        name: "description",
        content: "Base de clientes com pedidos, total gasto e histórico individual.",
      },
      { property: "og:title", content: "Clientes — Painel Sabor da Casa" },
      { property: "og:description", content: "Conheça seus clientes e o que eles mais pedem." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const { customers, orders } = useApp();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);

  const rows = customers
    .map((customer) => {
      const myOrders = orders.filter((o) => o.customerId === customer.id);
      return {
        customer,
        count: myOrders.length,
        total: myOrders.reduce((sum, o) => sum + o.total, 0),
        last: myOrders[0]?.createdAt,
      };
    })
    .filter((row) =>
      `${row.customer.name} ${row.customer.phone} ${row.customer.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  const selectedOrders = selected
    ? orders.filter((o) => o.customerId === selected.id)
    : [];
  const topProduct = Object.entries(
    selectedOrders
      .flatMap((o) => o.items)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.name] = (acc[item.name] ?? 0) + item.quantity;
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1])[0];

  return (
    <RestaurantLayout
      title="Clientes"
      subtitle={`${rows.length} cliente(s)`}
      actions={
        <label className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 md:flex md:w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
      }
    >
      <label className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 md:hidden">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <button
            key={row.customer.id}
            onClick={() => setSelected(row.customer)}
            className="card-surface flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-float"
          >
            <img
              src={row.customer.avatar}
              alt={row.customer.name}
              loading="lazy"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl bg-primary-soft"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-foreground">{row.customer.name}</p>
              <p className="truncate text-xs text-muted-foreground">{row.customer.phone}</p>
              <p className="truncate text-xs text-muted-foreground">{row.customer.email}</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-foreground">{row.count} pedidos</p>
              <p className="text-muted-foreground">{currency(row.total)}</p>
              {row.last && <p className="text-muted-foreground">{formatDate(row.last)}</p>}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-card p-6 sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selected.avatar}
                  alt={selected.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl bg-primary-soft"
                />
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.phone}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Fechar">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Box label="Total de pedidos" value={String(selectedOrders.length)} />
              <Box
                label="Total gasto"
                value={currency(selectedOrders.reduce((s, o) => s + o.total, 0))}
              />
              <Box label="Mais comprado" value={topProduct?.[0] ?? "—"} />
            </div>

            <div className="mt-4 rounded-xl bg-muted p-4 text-sm">
              <p className="font-bold text-foreground">Endereço</p>
              <p className="text-muted-foreground">
                {selected.address} · {selected.district}
              </p>
              <p className="text-muted-foreground">
                {selected.city} · CEP {selected.cep}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-bold text-foreground">Histórico de pedidos</p>
              <ul className="mt-2 space-y-2">
                {selectedOrders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-xl border border-border p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{order.code}</span>
                      <span className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="font-bold">{currency(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </RestaurantLayout>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-extrabold text-foreground">{value}</p>
    </div>
  );
}

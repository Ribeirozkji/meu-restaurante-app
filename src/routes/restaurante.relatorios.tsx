import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, Receipt, TrendingUp, Users } from "lucide-react";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { useApp } from "@/store/app-store";
import { StatCard } from "@/components/restaurant/StatCard";
import { currency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/restaurante/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Painel Sabor da Casa" },
      {
        name: "description",
        content:
          "Relatórios de faturamento, ticket médio, formas de pagamento e fechamento diário do restaurante.",
      },
      { property: "og:title", content: "Relatórios — Painel Sabor da Casa" },
      {
        property: "og:description",
        content: "Fechamento diário e indicadores financeiros do restaurante.",
      },
    ],
  }),
  component: Relatorios,
});

const ranges = [
  { id: 7, label: "7 dias" },
  { id: 15, label: "15 dias" },
  { id: 30, label: "30 dias" },
];

const paymentLabel = { pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão" } as const;

function Relatorios() {
  const { dailyClosings, orders, customers } = useApp();
  const [days, setDays] = useState(7);

  const period = useMemo(
    () => [...dailyClosings].slice(0, days).reverse(),
    [dailyClosings, days],
  );

  const revenue = period.reduce((s, d) => s + d.revenue, 0);
  const count = period.reduce((s, d) => s + d.orders, 0);
  const ticket = count ? revenue / count : 0;

  const byPayment = (["pix", "dinheiro", "cartao"] as const).map((payment) => {
    const list = orders.filter((o) => o.payment === payment);
    return {
      payment,
      label: paymentLabel[payment],
      count: list.length,
      total: list.reduce((s, o) => s + o.total, 0),
    };
  });

  const chartData = period.map((d) => ({
    date: formatDate(d.date).slice(0, 5),
    faturamento: d.revenue,
    pedidos: d.orders,
    ticket: d.averageTicket,
  }));

  return (
    <RestaurantLayout title="Relatórios" subtitle="Fechamento e desempenho financeiro">
      <div className="mb-4 flex gap-2">
        {ranges.map((range) => (
          <button
            key={range.id}
            onClick={() => setDays(range.id)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs font-semibold",
              days === range.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento" value={currency(revenue)} icon={DollarSign} />
        <StatCard label="Pedidos" value={String(count)} icon={Receipt} />
        <StatCard label="Ticket médio" value={currency(ticket)} icon={TrendingUp} />
        <StatCard label="Clientes cadastrados" value={String(customers.length)} icon={Users} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Faturamento por dia</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Ticket médio por dia</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => currency(v)} />
                <Bar dataKey="ticket" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Formas de pagamento</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {byPayment.map((row) => (
              <li key={row.payment} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {row.label} · {row.count} pedidos
                </span>
                <span className="font-bold text-foreground">{currency(row.total)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface overflow-x-auto p-0 xl:col-span-2">
          <h2 className="px-5 pt-5 text-sm font-bold text-foreground">Fechamento diário</h2>
          <table className="mt-3 w-full min-w-120 text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Data", "Pedidos", "Faturamento", "Ticket médio"].map((header) => (
                  <th key={header} className="px-5 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...period].reverse().map((day) => (
                <tr key={day.date}>
                  <td className="px-5 py-3 font-semibold text-foreground">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{day.orders}</td>
                  <td className="px-5 py-3 font-bold">{currency(day.revenue)}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {currency(day.averageTicket)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RestaurantLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { DollarSign, Package, Receipt, TrendingUp, Users } from "lucide-react";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { StatCard } from "@/components/restaurant/StatCard";
import { useApp } from "@/store/app-store";
import { categories } from "@/data/mock";
import { currency, formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/restaurante/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Painel Sabor da Casa" },
      {
        name: "description",
        content: "Faturamento, pedidos, ticket médio e vendas por categoria do restaurante.",
      },
      { property: "og:title", content: "Dashboard — Painel Sabor da Casa" },
      { property: "og:description", content: "Indicadores do restaurante em tempo real." },
    ],
  }),
  component: Dashboard,
});

const ranges = [
  { id: "hoje", label: "Hoje", days: 1 },
  { id: "7d", label: "7 dias", days: 7 },
  { id: "30d", label: "30 dias", days: 30 },
  { id: "mes", label: "Este mês", days: 29 },
  { id: "anterior", label: "Mês anterior", days: 30 },
  { id: "custom", label: "Personalizado", days: 14 },
] as const;

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Dashboard() {
  const { dailyClosings, orders, products, customers } = useApp();
  const [range, setRange] = useState<string>("30d");

  const days = ranges.find((r) => r.id === range)?.days ?? 30;
  const series = useMemo(
    () =>
      dailyClosings
        .slice(0, days)
        .map((d) => ({
          date: formatDate(d.date).slice(0, 5),
          faturamento: d.revenue,
          pedidos: d.orders,
        }))
        .reverse(),
    [dailyClosings, days],
  );

  const revenue = series.reduce((sum, d) => sum + d.faturamento, 0);
  const orderCount = series.reduce((sum, d) => sum + d.pedidos, 0);
  const ticket = orderCount ? revenue / orderCount : 0;
  const soldProducts = products.reduce((sum, p) => sum + p.sales, 0);

  const byCategory = categories
    .filter((c) => c.id !== "promocoes")
    .map((category) => ({
      name: category.name,
      vendas: products
        .filter((p) => p.category === category.id)
        .reduce((sum, p) => sum + p.sales, 0),
    }));

  const byDistrict = Object.entries(
    orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.district] = (acc[order.district] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 6);

  return (
    <RestaurantLayout
      title="Dashboard"
      subtitle="Visão geral do desempenho do restaurante"
      actions={
        <div className="hidden gap-1 rounded-xl border border-border bg-card p-1 md:flex">
          {ranges.map((option) => (
            <button
              key={option.id}
              onClick={() => setRange(option.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold",
                range === option.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:hidden">
        {ranges.map((option) => (
          <button
            key={option.id}
            onClick={() => setRange(option.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold",
              range === option.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Faturamento" value={currency(revenue)} delta={12.4} icon={DollarSign} />
        <StatCard label="Pedidos" value={String(orderCount)} delta={8.1} icon={Receipt} />
        <StatCard label="Ticket médio" value={currency(ticket)} delta={3.2} icon={TrendingUp} />
        <StatCard label="Clientes" value={String(customers.length * 21)} delta={5.6} icon={Users} />
        <StatCard label="Produtos vendidos" value={String(soldProducts)} delta={-2.3} icon={Package} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Faturamento" subtitle={`Últimos ${days} dia(s)`}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip formatter={(v: number) => currency(v)} />
              <Line
                type="monotone"
                dataKey="faturamento"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pedidos por dia" subtitle="Volume diário">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip />
              <Bar dataKey="pedidos" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Categorias mais vendidas" subtitle="Total de itens vendidos">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
              />
              <Tooltip />
              <Bar dataKey="vendas" radius={[0, 6, 6, 0]}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Regiões dos pedidos" subtitle="Bairros atendidos">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byDistrict} dataKey="value" nameKey="name" outerRadius={95} label>
                {byDistrict.map((_, i) => (
                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="card-surface mt-5 p-5">
        <h2 className="text-sm font-bold text-foreground">Produtos mais vendidos</h2>
        <ol className="mt-3 space-y-2">
          {topProducts.map((product, index) => (
            <li
              key={product.id}
              className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5 text-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
              <span className="flex-1 font-semibold text-foreground">{product.name}</span>
              <span className="text-muted-foreground">{product.sales} vendas</span>
              <span className="font-bold text-foreground">{currency(product.price)}</span>
            </li>
          ))}
        </ol>
      </div>
    </RestaurantLayout>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-5">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

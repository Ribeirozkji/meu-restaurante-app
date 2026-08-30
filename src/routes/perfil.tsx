import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Mail, MapPin, Phone, Receipt } from "lucide-react";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { currency, formatDate } from "@/utils/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Sabor da Casa" },
      {
        name: "description",
        content: "Seus dados, endereços, histórico e produtos mais pedidos no Sabor da Casa.",
      },
      { property: "og:title", content: "Meu perfil — Sabor da Casa" },
      { property: "og:description", content: "Gerencie seus dados e veja seus favoritos." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { customer, orders, addresses } = useApp();
  const myOrders = orders.filter((o) => o.customerId === customer.id);

  const favorites = Object.values(
    myOrders
      .flatMap((o) => o.items)
      .reduce<Record<string, { name: string; count: number }>>((acc, item) => {
        const current = acc[item.productId] ?? { name: item.name, count: 0 };
        acc[item.productId] = { name: item.name, count: current.count + item.quantity };
        return acc;
      }, {}),
  ).sort((a, b) => b.count - a.count);

  const totalSpent = myOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <ClientLayout>
      <div className="card-surface flex flex-wrap items-center gap-4 p-5">
        <img
          src={customer.avatar}
          alt={customer.name}
          width={72}
          height={72}
          className="h-16 w-16 rounded-2xl bg-primary-soft"
        />
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold text-foreground sm:text-xl">
            {customer.name}
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {customer.phone}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" /> {customer.email}
          </p>
        </div>
        <div className="ml-auto grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Pedidos</p>
            <p className="text-lg font-extrabold text-foreground">{myOrders.length}</p>
          </div>
          <div className="rounded-xl bg-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">Total gasto</p>
            <p className="text-lg font-extrabold text-foreground">{currency(totalSpent)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Heart className="h-4 w-4 text-primary" /> Meus favoritos / mais pedidos
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {favorites.slice(0, 6).map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5"
              >
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="text-xs font-bold text-primary">
                  {item.count} pedidos
                </span>
              </li>
            ))}
            {favorites.length === 0 && (
              <li className="text-sm text-muted-foreground">Nenhum pedido ainda.</li>
            )}
          </ul>
        </section>

        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <MapPin className="h-4 w-4 text-primary" /> Endereços
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {addresses.map((a) => (
              <li key={a.id} className="rounded-xl bg-muted px-3 py-2.5">
                <span className="font-semibold text-foreground">{a.label}</span> —{" "}
                {a.street}, {a.number} · {a.district}
              </li>
            ))}
          </ul>
          <Link to="/enderecos" className="mt-3 inline-block text-sm font-semibold text-primary">
            Gerenciar endereços
          </Link>
        </section>

        <section className="card-surface p-5 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Receipt className="h-4 w-4 text-primary" /> Histórico recente
          </h2>
          <ul className="mt-3 space-y-2">
            {myOrders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link
                  to="/pedido/$id"
                  params={{ id: order.id }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-foreground">{order.code}</span>
                  <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                  <span className="font-bold text-foreground">{currency(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/historico" className="mt-3 inline-block text-sm font-semibold text-primary">
            Ver todos os pedidos
          </Link>
        </section>
      </div>
    </ClientLayout>
  );
}

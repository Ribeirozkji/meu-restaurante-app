import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { currency, formatDate, formatTime } from "@/utils/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Meus pedidos — Sabor da Casa" },
      {
        name: "description",
        content: "Histórico completo dos seus pedidos no Sabor da Casa com valores e status.",
      },
      { property: "og:title", content: "Meus pedidos — Sabor da Casa" },
      { property: "og:description", content: "Veja seus pedidos anteriores e repita o favorito." },
    ],
  }),
  component: Historico,
});

function Historico() {
  const { orders, customer } = useApp();
  const myOrders = orders.filter((o) => o.customerId === customer.id);

  return (
    <ClientLayout>
      <h1 className="mb-4 text-xl font-extrabold text-foreground sm:text-2xl">Meus pedidos</h1>

      {myOrders.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <p className="text-sm text-muted-foreground">Você ainda não fez pedidos.</p>
          <Link to="/cardapio" className="mt-3 inline-block font-semibold text-primary">
            Ver cardápio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((order) => (
            <Link
              key={order.id}
              to="/pedido/$id"
              params={{ id: order.id }}
              className="card-surface block p-4 transition-shadow hover:shadow-float"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-foreground">{order.code}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(order.createdAt)} às {formatTime(order.createdAt)}
              </p>
              <ul className="mt-2 text-sm text-muted-foreground">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.quantity} × {item.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-base font-extrabold text-foreground">
                {currency(order.total)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}

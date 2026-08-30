import { Printer, X } from "lucide-react";
import type { Order } from "@/types";
import { currency, formatDate, formatTime } from "@/utils/format";
import { OrderStatusBadge } from "@/components/shared/status-badge";
import { useApp } from "@/store/app-store";
import type { OrderStatus } from "@/types";

const paymentLabel = { pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão" } as const;

const nextStatus: Array<{ status: OrderStatus; label: string }> = [
  { status: "novo", label: "Novo" },
  { status: "preparacao", label: "Em preparação" },
  { status: "entrega", label: "Saiu para entrega" },
  { status: "entregue", label: "Entregue" },
  { status: "cancelado", label: "Cancelado" },
];

export function OrderReceipt({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const { updateOrderStatus } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-6 shadow-float sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Comprovante do pedido
            </p>
            <h2 className="text-lg font-extrabold text-foreground">{order.code}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Cliente" value={order.customerName} />
          <Row label="Telefone" value={order.customerPhone} />
          <Row label="Endereço" value={order.address} />
          <Row label="Data" value={`${formatDate(order.createdAt)} ${formatTime(order.createdAt)}`} />
        </dl>

        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-bold text-foreground">Produtos</p>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold">{currency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <Row label="Subtotal" value={currency(order.subtotal)} />
          <Row label="Entrega" value={currency(order.deliveryFee)} />
          <div className="flex justify-between text-base font-extrabold text-foreground">
            <span>Total</span>
            <span>{currency(order.total)}</span>
          </div>
          <Row label="Pagamento" value={paymentLabel[order.payment]} />
          <div className="flex items-center justify-between pt-1">
            <span className="text-muted-foreground">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-bold text-foreground">Alterar status</p>
          <div className="flex flex-wrap gap-2">
            {nextStatus.map((option) => (
              <button
                key={option.status}
                onClick={() => updateOrderStatus(order.id, option.status)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          <Printer className="h-4 w-4" /> Imprimir comprovante
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, Copy, CreditCard, MapPin, QrCode } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { buildPixPayload, currency, formatKm } from "@/utils/format";
import type { PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Sabor da Casa" },
      {
        name: "description",
        content: "Confirme produtos, endereço e forma de pagamento (PIX, dinheiro ou cartão).",
      },
      { property: "og:title", content: "Checkout — Sabor da Casa" },
      { property: "og:description", content: "Finalize seu pedido em poucos passos." },
    ],
  }),
  component: Checkout,
});

const methods: Array<{ id: PaymentMethod; label: string; icon: typeof QrCode }> = [
  { id: "pix", label: "PIX", icon: QrCode },
  { id: "dinheiro", label: "Dinheiro", icon: Banknote },
  { id: "cartao", label: "Cartão na entrega", icon: CreditCard },
];

function Checkout() {
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    selectedAddress,
    restaurant,
    placeOrder,
  } = useApp();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [showPix, setShowPix] = useState(false);

  const total = cartSubtotal + deliveryFee;
  const pixCode = buildPixPayload(restaurant.pixKey, restaurant.name, total);

  if (cart.length === 0) {
    return (
      <ClientLayout>
        <div className="card-surface p-12 text-center">
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          <Link to="/cardapio" className="mt-3 inline-block font-semibold text-primary">
            Ver cardápio
          </Link>
        </div>
      </ClientLayout>
    );
  }

  function confirm() {
    const order = placeOrder(payment);
    toast.success("Pedido enviado para o restaurante!");
    navigate({ to: "/pedido/$id", params: { id: order.id } });
  }

  return (
    <ClientLayout>
      <h1 className="mb-4 text-xl font-extrabold text-foreground sm:text-2xl">Checkout</h1>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <section className="card-surface p-4">
            <h2 className="text-sm font-bold text-foreground">Produtos</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {cart.map((item) => (
                <li key={item.key} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-semibold">
                    {currency(
                      (item.price + item.addons.reduce((s, a) => s + a.price, 0)) *
                        item.quantity,
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-surface p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Entrega
            </h2>
            {selectedAddress ? (
              <div className="mt-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {selectedAddress.street}, {selectedAddress.number}
                </p>
                <p>
                  {selectedAddress.district} · {selectedAddress.city}/{selectedAddress.state}
                </p>
                <p className="mt-2 grid grid-cols-2 gap-2">
                  <span className="rounded-lg bg-muted px-3 py-2">
                    Distância estimada
                    <strong className="block text-foreground">
                      {formatKm(selectedAddress.distanceKm)}
                    </strong>
                  </span>
                  <span className="rounded-lg bg-muted px-3 py-2">
                    Taxa de entrega
                    <strong className="block text-foreground">{currency(deliveryFee)}</strong>
                  </span>
                </p>
              </div>
            ) : (
              <Link to="/enderecos" className="mt-2 block text-sm font-semibold text-primary">
                Cadastrar endereço
              </Link>
            )}
          </section>

          <section className="card-surface p-4">
            <h2 className="text-sm font-bold text-foreground">Pagamento</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => {
                    setPayment(method.id);
                    setShowPix(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                    payment === method.id
                      ? "border-primary bg-primary-soft text-primary-strong"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  <method.icon className="h-4 w-4" /> {method.label}
                </button>
              ))}
            </div>
          </section>

          {payment === "pix" && showPix && (
            <section className="card-surface space-y-4 p-6 text-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pague para
                </p>
                <p className="text-lg font-extrabold text-foreground">{restaurant.name}</p>
                <p className="mt-1 text-3xl font-extrabold text-primary">{currency(total)}</p>
              </div>

              <FakeQrCode />

              <div className="space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Chave PIX
                </p>
                <p className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">
                  {restaurant.pixKey}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  PIX Copia e Cola
                </p>
                <p className="break-all rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  {pixCode}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(pixCode);
                    toast.success("Código PIX copiado!");
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-sm font-bold text-primary"
                >
                  <Copy className="h-4 w-4" /> Copiar PIX
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 rounded-xl bg-success px-4 py-3 text-sm font-bold text-success-foreground"
                >
                  Já realizei o pagamento
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="card-surface space-y-2 p-4 text-sm lg:sticky lg:top-24 lg:self-start">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground">{currency(cartSubtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxa de entrega</span>
            <span className="font-semibold text-foreground">{currency(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-bold">Total</span>
            <span className="text-lg font-extrabold">{currency(total)}</span>
          </div>
          {payment === "pix" && !showPix ? (
            <button
              onClick={() => setShowPix(true)}
              className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-float"
            >
              Pagar com PIX
            </button>
          ) : payment !== "pix" ? (
            <button
              onClick={confirm}
              className="mt-2 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-float"
            >
              Confirmar pedido
            </button>
          ) : null}
        </aside>
      </div>
    </ClientLayout>
  );
}

/** QR Code fictício apenas para representação visual. */
function FakeQrCode() {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => (i * 7919) % 11 < 5);
  return (
    <div className="mx-auto grid w-44 grid-cols-21 gap-0 rounded-xl bg-card p-3 shadow-card">
      <div className="grid w-full grid-cols-[repeat(21,1fr)]">
        {cells.map((filled, i) => (
          <span
            key={i}
            className={cn("aspect-square", filled ? "bg-foreground" : "bg-card")}
          />
        ))}
      </div>
    </div>
  );
}

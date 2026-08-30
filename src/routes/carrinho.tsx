import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { currency, formatKm } from "@/utils/format";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Meu carrinho — Sabor da Casa" },
      {
        name: "description",
        content: "Revise os itens do seu pedido, o endereço de entrega e a taxa antes de finalizar.",
      },
      { property: "og:title", content: "Meu carrinho — Sabor da Casa" },
      { property: "og:description", content: "Revise seu pedido antes de finalizar." },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    deliveryFee,
    selectedAddress,
  } = useApp();

  if (cart.length === 0) {
    return (
      <ClientLayout>
        <div className="card-surface flex flex-col items-center gap-4 p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          <Link
            to="/cardapio"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            Ver cardápio
          </Link>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <h1 className="mb-4 text-xl font-extrabold text-foreground sm:text-2xl">Carrinho</h1>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {cart.map((item) => {
            const unit = item.price + item.addons.reduce((s, a) => s + a.price, 0);
            return (
              <div key={item.key} className="card-surface flex gap-3 p-3">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={96}
                  height={96}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <button
                      onClick={() => removeFromCart(item.key)}
                      aria-label="Remover item"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.addons.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      + {item.addons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  {item.note && (
                    <p className="text-xs italic text-muted-foreground">Obs.: {item.note}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 rounded-lg border border-border px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        aria-label="Diminuir"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        aria-label="Aumentar"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-extrabold text-foreground">
                      {currency(unit * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Endereço de entrega
            </p>
            {selectedAddress ? (
              <div className="mt-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{selectedAddress.label}</p>
                <p>
                  {selectedAddress.street}, {selectedAddress.number}
                  {selectedAddress.complement && ` — ${selectedAddress.complement}`}
                </p>
                <p>
                  {selectedAddress.district} · {selectedAddress.city}/{selectedAddress.state}
                </p>
                <p className="mt-1 text-xs">
                  Distância estimada: {formatKm(selectedAddress.distanceKm)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
            )}
            <Link
              to="/enderecos"
              className="mt-3 inline-block text-sm font-semibold text-primary"
            >
              {selectedAddress ? "Trocar endereço" : "Cadastrar endereço"}
            </Link>
          </div>

          <div className="card-surface space-y-2 p-4 text-sm">
            <Row label="Subtotal" value={currency(cartSubtotal)} />
            <Row label="Taxa de entrega" value={currency(deliveryFee)} />
            <div className="border-t border-border pt-2">
              <Row
                label="Total"
                value={currency(cartSubtotal + deliveryFee)}
                strong
              />
            </div>
            <Link
              to="/checkout"
              className="mt-2 block rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground shadow-float"
            >
              Ir para o checkout
            </Link>
          </div>
        </aside>
      </div>
    </ClientLayout>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-bold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "text-lg font-extrabold text-foreground" : "font-semibold"}>
        {value}
      </span>
    </div>
  );
}

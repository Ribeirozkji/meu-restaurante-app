import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { currency } from "@/utils/format";
import type { Addon } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/produto/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do prato — Sabor da Casa" },
      {
        name: "description",
        content: "Veja ingredientes, adicionais e preço antes de adicionar ao carrinho.",
      },
      { property: "og:title", content: "Detalhes do prato — Sabor da Casa" },
      {
        property: "og:description",
        content: "Monte seu pedido com adicionais e observações.",
      },
    ],
  }),
  component: ProdutoDetalhe,
});

function ProdutoDetalhe() {
  const { id } = Route.useParams();
  const { products, addToCart } = useApp();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [note, setNote] = useState("");

  if (!product) {
    return (
      <ClientLayout>
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Prato não encontrado.</p>
          <Link to="/cardapio" className="mt-4 inline-block font-semibold text-primary">
            Voltar ao cardápio
          </Link>
        </div>
      </ClientLayout>
    );
  }

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const total = (product.price + addonsTotal) * quantity;

  return (
    <ClientLayout>
      <Link
        to="/cardapio"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao cardápio
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          width={768}
          height={576}
          className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
        />

        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-warning-foreground">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {product.rating.toFixed(1)} · {product.sales} vendidos
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-4 text-2xl font-extrabold text-primary">
              {currency(product.price)}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Ingredientes</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.ingredients.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Adicionais</h2>
            <div className="mt-2 space-y-2">
              {product.addons.map((addon) => {
                const checked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                      checked ? "border-primary bg-primary-soft" : "border-border bg-card",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedAddons((prev) =>
                            checked
                              ? prev.filter((a) => a.id !== addon.id)
                              : [...prev, addon],
                          )
                        }
                        className="h-4 w-4 accent-primary"
                      />
                      {addon.name}
                    </span>
                    <span className="font-semibold">+ {currency(addon.price)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground">Observação</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ex.: sem cebola, ponto da carne bem passado..."
              className="mt-2 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className="text-muted-foreground hover:text-foreground"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar quantidade"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              disabled={!product.available}
              onClick={() => {
                addToCart(product, quantity, selectedAddons, note);
                toast.success("Adicionado ao carrinho");
                navigate({ to: "/carrinho" });
              }}
              className="flex-1 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-float transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Adicionar ao carrinho · {currency(total)}
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

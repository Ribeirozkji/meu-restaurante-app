import { Link } from "@tanstack/react-router";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { currency } from "@/utils/format";
import { useApp } from "@/store/app-store";
import { Pill } from "@/components/shared/status-badge";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useApp();

  return (
    <article className="card-surface group flex flex-col overflow-hidden transition-shadow hover:shadow-float">
      <Link
        to="/produto/$id"
        params={{ id: product.id }}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={768}
          height={576}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!product.available && (
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 text-sm font-semibold text-background">
            Indisponível
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/produto/$id"
            params={{ id: product.id }}
            className="text-sm font-bold leading-tight text-foreground hover:text-primary sm:text-base"
          >
            {product.name}
          </Link>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-warning-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            <p className="text-base font-extrabold text-foreground">
              {currency(product.price)}
            </p>
            <Pill tone={product.available ? "success" : "danger"}>
              {product.available ? "Disponível" : "Esgotado"}
            </Pill>
          </div>
          <button
            disabled={!product.available}
            onClick={() => {
              addToCart(product, 1, [], "");
              toast.success(`${product.name} adicionado ao carrinho`);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

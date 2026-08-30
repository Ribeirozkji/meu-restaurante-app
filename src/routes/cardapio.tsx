import { createFileRoute } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { ClientLayout } from "@/layouts/ClientLayout";
import { ProductCard } from "@/components/client/ProductCard";
import { categories, promoProductIds } from "@/data/mock";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio digital — Restaurante Sabor da Casa" },
      {
        name: "description",
        content:
          "Veja o cardápio completo do Sabor da Casa: café da manhã, lanches, almoço, jantar, bebidas e sobremesas.",
      },
      { property: "og:title", content: "Cardápio digital — Sabor da Casa" },
      {
        property: "og:description",
        content: "Escolha seu prato favorito e receba em casa com entrega rápida.",
      },
    ],
  }),
  component: Cardapio,
});

function Cardapio() {
  const { products } = useApp();
  const [category, setCategory] = useState<string>("todos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "todos"
          ? true
          : category === "promocoes"
            ? promoProductIds.includes(product.id)
            : product.category === category;
      const matchesQuery = `${product.name} ${product.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  const search = (
    <div className="mx-auto max-w-6xl px-4 pb-3">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar prato, bebida ou sobremesa..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>
    </div>
  );

  return (
    <ClientLayout showSearch={search}>
      <section className="card-surface mb-6 flex flex-col gap-3 overflow-hidden bg-gradient-brand p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-foreground/80">
            <Sparkles className="h-4 w-4" /> Promoção do dia
          </p>
          <h2 className="mt-2 text-xl font-extrabold text-primary-foreground sm:text-2xl">
            Combo X-Burger + Batata + Refri
          </h2>
          <p className="text-sm text-primary-foreground/85">
            Peça hoje e ganhe 15% de desconto no combo completo.
          </p>
        </div>
        <button
          onClick={() => setCategory("promocoes")}
          className="rounded-xl bg-card px-5 py-3 text-sm font-bold text-primary"
        >
          Ver promoções
        </button>
      </section>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ id: "todos", name: "Todos" }, ...categories].map((item) => (
          <button
            key={item.id}
            onClick={() => setCategory(item.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              category === item.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nenhum item encontrado para esta busca.
        </p>
      )}
    </ClientLayout>
  );
}

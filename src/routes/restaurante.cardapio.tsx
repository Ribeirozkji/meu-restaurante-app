import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { useApp } from "@/store/app-store";
import { categories, imageForCategory } from "@/data/mock";
import { currency } from "@/utils/format";
import { Pill } from "@/components/shared/status-badge";
import type { CategoryId, Product } from "@/types";

export const Route = createFileRoute("/restaurante/cardapio")({
  head: () => ({
    meta: [
      { title: "Gerenciar cardápio — Painel Sabor da Casa" },
      {
        name: "description",
        content: "Cadastre, edite preços e controle a disponibilidade dos pratos do restaurante.",
      },
      { property: "og:title", content: "Gerenciar cardápio — Painel Sabor da Casa" },
      { property: "og:description", content: "Controle total dos pratos e preços." },
    ],
  }),
  component: CardapioAdmin,
});

type Form = {
  id?: string;
  name: string;
  category: CategoryId;
  price: string;
  description: string;
  available: boolean;
};

const emptyForm: Form = {
  name: "",
  category: "lanches",
  price: "",
  description: "",
  available: true,
};

function CardapioAdmin() {
  const { products, saveProduct, removeProduct, toggleProduct, stock } = useApp();
  const [form, setForm] = useState<Form | null>(null);

  function submit() {
    if (!form) return;
    const price = Number(form.price.replace(",", "."));
    if (!form.name || !price) {
      toast.error("Informe nome e preço válidos.");
      return;
    }
    const existing = products.find((p) => p.id === form.id);
    const product: Product = {
      id: form.id ?? `p${Date.now()}`,
      name: form.name,
      description: form.description,
      ingredients: existing?.ingredients ?? [],
      price,
      category: form.category,
      rating: existing?.rating ?? 4.5,
      available: form.available,
      image: existing?.image ?? imageForCategory(form.category),
      addons: existing?.addons ?? [],
      sales: existing?.sales ?? 0,
    };
    saveProduct(product);
    toast.success(form.id ? "Produto atualizado" : "Produto adicionado");
    setForm(null);
  }

  return (
    <RestaurantLayout
      title="Cardápio"
      subtitle={`${products.length} produtos cadastrados`}
      actions={
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Adicionar produto
        </button>
      }
    >
      {form && (
        <div className="card-surface mb-5 p-5">
          <h2 className="text-sm font-bold text-foreground">
            {form.id ? "Editar produto" : "Novo produto"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-muted-foreground">Nome</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-muted-foreground">Preço (R$)</span>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold text-muted-foreground">Categoria</span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as CategoryId })
                }
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 self-end text-sm font-medium">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Produto ativo
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold text-muted-foreground">Descrição</span>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={submit}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Salvar
            </button>
            <button
              onClick={() => setForm(null)}
              className="rounded-xl border border-border px-5 py-3 text-sm font-bold text-muted-foreground"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Foto", "Nome", "Categoria", "Preço", "Estoque", "Disponibilidade", "Ações"].map(
                (header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => {
              const stockItem = stock.find((s) =>
                s.name.toLowerCase().includes(product.name.split(" ")[0]!.toLowerCase()),
              );
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      width={56}
                      height={56}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {categories.find((c) => c.id === product.category)?.name}
                  </td>
                  <td className="px-4 py-3 font-bold">{currency(product.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {stockItem ? `${stockItem.quantity} ${stockItem.unit}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleProduct(product.id)}>
                      <Pill tone={product.available ? "success" : "danger"}>
                        {product.available ? "Ativo" : "Inativo"}
                      </Pill>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        aria-label="Editar"
                        onClick={() =>
                          setForm({
                            id: product.id,
                            name: product.name,
                            category: product.category,
                            price: String(product.price),
                            description: product.description,
                            available: product.available,
                          })
                        }
                        className="rounded-lg border border-border p-2 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Excluir"
                        onClick={() => {
                          removeProduct(product.id);
                          toast.success("Produto excluído");
                        }}
                        className="rounded-lg border border-destructive/40 p-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </RestaurantLayout>
  );
}

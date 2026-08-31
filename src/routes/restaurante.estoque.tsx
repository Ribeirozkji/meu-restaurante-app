import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Boxes, Minus, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { stockStatus, useApp } from "@/store/app-store";
import { StatCard } from "@/components/restaurant/StatCard";
import { Pill } from "@/components/shared/status-badge";

export const Route = createFileRoute("/restaurante/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Painel Sabor da Casa" },
      {
        name: "description",
        content: "Controle de insumos: quantidades, estoque mínimo e itens críticos ou esgotados.",
      },
      { property: "og:title", content: "Estoque — Painel Sabor da Casa" },
      { property: "og:description", content: "Monitore insumos e evite ruptura de estoque." },
    ],
  }),
  component: Estoque,
});

const tones = {
  normal: "success",
  baixo: "warning",
  critico: "danger",
  esgotado: "danger",
} as const;

const labels = {
  normal: "Normal",
  baixo: "Baixo",
  critico: "Crítico",
  esgotado: "Esgotado",
} as const;

function Estoque() {
  const { stock, updateStock } = useApp();

  const total = stock.reduce((sum, item) => sum + item.quantity, 0);
  const low = stock.filter((item) => stockStatus(item) === "baixo" || stockStatus(item) === "critico").length;
  const out = stock.filter((item) => stockStatus(item) === "esgotado").length;

  return (
    <RestaurantLayout title="Estoque" subtitle="Controle de insumos do restaurante">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total de itens" value={String(total)} icon={Boxes} />
        <StatCard label="Estoque baixo" value={String(low)} icon={AlertTriangle} />
        <StatCard label="Esgotados" value={String(out)} icon={XCircle} />
      </div>

      <div className="card-surface mt-5 overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Produto", "Categoria", "Quantidade", "Estoque mínimo", "Status", "Ações"].map(
                (header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stock.map((item) => {
              const status = stockStatus(item);
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3 font-bold">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.minQuantity} {item.unit}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={tones[status]}>{labels[status]}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        aria-label="Remover 10"
                        onClick={() => updateStock(item.id, item.quantity - 10)}
                        className="rounded-lg border border-border p-2 text-muted-foreground"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Adicionar 10"
                        onClick={() => {
                          updateStock(item.id, item.quantity + 10);
                          toast.success(`+10 ${item.unit} em ${item.name}`);
                        }}
                        className="rounded-lg border border-border p-2 text-muted-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          updateStock(item.id, 0);
                          toast.success(`${item.name} marcado como esgotado`);
                        }}
                        className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive"
                      >
                        Marcar esgotado
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

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RestaurantLayout } from "@/layouts/RestaurantLayout";
import { useApp } from "@/store/app-store";
import { currency } from "@/utils/format";
import { calculateDeliveryFee } from "@/utils/delivery";

export const Route = createFileRoute("/restaurante/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Painel Sabor da Casa" },
      {
        name: "description",
        content:
          "Ajuste dados do restaurante, horário de funcionamento, chave PIX e regra de taxa de entrega.",
      },
      { property: "og:title", content: "Configurações — Painel Sabor da Casa" },
      {
        property: "og:description",
        content: "Identidade, PIX e entrega em um único lugar.",
      },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { restaurant, updateRestaurant } = useApp();
  const [form, setForm] = useState(restaurant);

  function save() {
    updateRestaurant(form);
    toast.success("Configurações salvas");
  }

  return (
    <RestaurantLayout title="Configurações" subtitle="Dados do restaurante, PIX e entrega">
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Identidade</h2>
          <div className="mt-4 space-y-3">
            <Field
              label="Nome do restaurante"
              value={form.name}
              onChange={(name) => setForm({ ...form, name })}
            />
            <Field
              label="Slogan"
              value={form.tagline}
              onChange={(tagline) => setForm({ ...form, tagline })}
            />
            <Field
              label="Telefone / WhatsApp"
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone })}
            />
            <Field
              label="Endereço"
              value={form.address}
              onChange={(address) => setForm({ ...form, address })}
            />
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-sm font-bold text-foreground">Funcionamento</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              label="Abre às"
              value={form.openTime}
              onChange={(openTime) => setForm({ ...form, openTime })}
            />
            <Field
              label="Fecha às"
              value={form.closeTime}
              onChange={(closeTime) => setForm({ ...form, closeTime })}
            />
          </div>

          <h2 className="mt-6 text-sm font-bold text-foreground">Pagamento PIX</h2>
          <div className="mt-3 space-y-3">
            <Field
              label="Chave PIX"
              value={form.pixKey}
              onChange={(pixKey) => setForm({ ...form, pixKey })}
            />
            <Field
              label="Nome do recebedor"
              value={form.pixReceiver}
              onChange={(pixReceiver) => setForm({ ...form, pixReceiver })}
            />
          </div>
        </section>

        <section className="card-surface p-5 xl:col-span-2">
          <h2 className="text-sm font-bold text-foreground">Taxa de entrega</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A taxa é calculada por blocos de distância: cada bloco iniciado adiciona o valor
            definido.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              label="Tamanho do bloco (km)"
              value={String(form.deliveryBlockKm)}
              onChange={(v) =>
                setForm({ ...form, deliveryBlockKm: Number(v.replace(",", ".")) || 1 })
              }
            />
            <Field
              label="Valor por bloco (R$)"
              value={String(form.deliveryFeePerBlock)}
              onChange={(v) =>
                setForm({ ...form, deliveryFeePerBlock: Number(v.replace(",", ".")) || 0 })
              }
            />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {[2, 4, 6, 10].map((km) => (
              <div key={km} className="rounded-xl bg-muted px-3 py-3 text-center">
                <p className="text-xs text-muted-foreground">{km} km</p>
                <p className="text-sm font-extrabold text-foreground">
                  {currency(
                    calculateDeliveryFee(km, form.deliveryBlockKm, form.deliveryFeePerBlock),
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={save}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Salvar alterações
        </button>
        <button
          onClick={() => setForm(restaurant)}
          className="rounded-xl border border-border px-6 py-3 text-sm font-bold text-muted-foreground"
        >
          Descartar
        </button>
      </div>
    </RestaurantLayout>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-primary"
      />
    </label>
  );
}

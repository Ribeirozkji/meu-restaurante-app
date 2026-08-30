import { createFileRoute } from "@tanstack/react-router";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useApp } from "@/store/app-store";
import { currency, formatKm } from "@/utils/format";
import { calculateDeliveryFee } from "@/utils/delivery";
import type { Address } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/enderecos")({
  head: () => ({
    meta: [
      { title: "Meus endereços — Sabor da Casa" },
      {
        name: "description",
        content: "Cadastre, edite e escolha o endereço principal de entrega dos seus pedidos.",
      },
      { property: "og:title", content: "Meus endereços — Sabor da Casa" },
      { property: "og:description", content: "Gerencie seus endereços de entrega." },
    ],
  }),
  component: Enderecos,
});

type FormState = Omit<Address, "id" | "distanceKm"> & { id?: string };

const emptyForm: FormState = {
  label: "Casa",
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "Recife",
  state: "PE",
  reference: "",
  isPrimary: false,
};

function Enderecos() {
  const { addresses, saveAddress, removeAddress, setPrimaryAddress, restaurant } =
    useApp();
  const [form, setForm] = useState<FormState | null>(null);

  function submit() {
    if (!form) return;
    if (!form.street || !form.number || !form.district) {
      toast.error("Preencha rua, número e bairro.");
      return;
    }
    saveAddress(form);
    toast.success(form.id ? "Endereço atualizado" : "Endereço cadastrado");
    setForm(null);
  }

  return (
    <ClientLayout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
          Endereço de entrega
        </h1>
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Novo
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={cn(
              "card-surface p-4",
              address.isPrimary && "border-primary ring-1 ring-primary",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 font-bold text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {address.label}
              </p>
              {address.isPrimary && (
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary-strong">
                  Principal
                </span>
              )}
            </div>
            <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
              <p>
                {address.street}, {address.number}
                {address.complement && ` — ${address.complement}`}
              </p>
              <p>
                {address.district} · {address.city}/{address.state}
              </p>
              <p>CEP {address.cep}</p>
              {address.reference && <p>Ref.: {address.reference}</p>}
              <p className="pt-1 text-xs">
                {formatKm(address.distanceKm)} ·{" "}
                {currency(
                  calculateDeliveryFee(
                    address.distanceKm,
                    restaurant.deliveryBlockKm,
                    restaurant.deliveryFeePerBlock,
                  ),
                )}{" "}
                de entrega
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {!address.isPrimary && (
                <button
                  onClick={() => setPrimaryAddress(address.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <Check className="h-3.5 w-3.5" /> Tornar principal
                </button>
              )}
              <button
                onClick={() => setForm({ ...address })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
              <button
                onClick={() => {
                  removeAddress(address.id);
                  toast.success("Endereço excluído");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="card-surface mt-6 p-5">
          <h2 className="text-sm font-bold text-foreground">
            {form.id ? "Editar endereço" : "Novo endereço"}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Identificação" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
            <Field label="CEP" value={form.cep} onChange={(v) => setForm({ ...form, cep: v })} />
            <Field label="Rua" value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
            <Field label="Número" value={form.number} onChange={(v) => setForm({ ...form, number: v })} />
            <Field label="Complemento" value={form.complement} onChange={(v) => setForm({ ...form, complement: v })} />
            <Field label="Bairro" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            <Field label="Referência" value={form.reference} onChange={(v) => setForm({ ...form, reference: v })} />
            <label className="flex items-center gap-2 self-end text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Usar como endereço principal
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={submit}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Salvar endereço
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
    </ClientLayout>
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

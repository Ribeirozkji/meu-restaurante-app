export function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatKm(km: number) {
  return `${km.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

/** PED-YYYYMMDD-#### */
export function buildOrderCode(date: Date, sequence: number) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `PED-${y}${m}${d}-${String(sequence).padStart(4, "0")}`;
}

export function buildPixPayload(pixKey: string, name: string, amount: number) {
  const cleanName = name.toUpperCase().slice(0, 25);
  return `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865802BR5913${cleanName}6009RECIFE62070503***${amount.toFixed(2).replace(".", "")}6304ABCD`;
}

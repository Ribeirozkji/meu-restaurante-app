/**
 * Regra de entrega: a cada 2 km -> + R$ 2,00
 * Função isolada, pronta para receber a distância real de uma API de mapas.
 */
export function calculateDeliveryFee(
  distanceKm: number,
  blockKm = 2,
  feePerBlock = 2,
) {
  if (distanceKm <= 0) return 0;
  return Math.ceil(distanceKm / blockKm) * feePerBlock;
}

/** Placeholder da futura chamada à API de mapas (Google/Mapbox). */
export function estimateDistanceKm(addressId?: string) {
  if (!addressId) return 4.3;
  let hash = 0;
  for (const char of addressId) hash = (hash * 31 + char.charCodeAt(0)) % 97;
  return Math.round((1.2 + (hash % 80) / 10) * 10) / 10;
}

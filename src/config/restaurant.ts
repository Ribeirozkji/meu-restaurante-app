import logo from "@/assets/logo.png";

export interface RestaurantConfig {
  name: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  openingHours: string;
  openFrom: number;
  openTo: number;
  pixKey: string;
  deliveryFeePerBlock: number;
  deliveryBlockKm: number;
}

export const defaultRestaurant: RestaurantConfig = {
  name: "Restaurante Sabor da Casa",
  tagline: "Peça sua refeição de forma rápida e fácil.",
  logo,
  address: "Rua das Palmeiras, 320 — Boa Viagem, Recife/PE",
  phone: "(81) 3333-1020",
  openingHours: "Todos os dias, 07:00 às 23:00",
  openFrom: 7,
  openTo: 23,
  pixKey: "pagamentos@sabordacasa.com.br",
  deliveryFeePerBlock: 2,
  deliveryBlockKm: 2,
};

export function isOpenNow(config: RestaurantConfig, date = new Date()) {
  const hour = date.getHours();
  return hour >= config.openFrom && hour < config.openTo;
}

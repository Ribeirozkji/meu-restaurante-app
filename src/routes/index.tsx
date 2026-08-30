import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, ShieldCheck, Truck, UtensilsCrossed } from "lucide-react";
import { useApp } from "@/store/app-store";
import { isOpenNow } from "@/config/restaurant";
import heroImage from "@/assets/cat-lanches.jpg";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Restaurante Sabor da Casa — Peça online com entrega" },
      {
        name: "description",
        content:
          "Site oficial de pedidos do Restaurante Sabor da Casa. Cardápio digital, entrega rápida e pagamento via PIX.",
      },
      { property: "og:title", content: "Restaurante Sabor da Casa — Peça online" },
      {
        property: "og:description",
        content: "Cardápio digital oficial: lanches, almoço, jantar, bebidas e sobremesas.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { restaurant } = useApp();
  const open = isOpenNow(restaurant);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Prato do Restaurante Sabor da Casa"
          width={768}
          height={576}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-brand opacity-90" />
        <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-5 py-16 text-center">
          <img
            src={restaurant.logo}
            alt={`Logo do ${restaurant.name}`}
            width={112}
            height={112}
            className="h-24 w-24 rounded-3xl bg-card p-3 shadow-float sm:h-28 sm:w-28"
          />
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-primary-foreground sm:text-5xl">
              {restaurant.name}
            </h1>
            <p className="text-base text-primary-foreground/85 sm:text-lg">
              {restaurant.tagline}
            </p>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold",
              open ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {open ? "Aberto agora" : "Fechado agora"}
          </span>

          <Link
            to="/cardapio"
            className="inline-flex items-center gap-2 rounded-2xl bg-card px-7 py-4 text-base font-bold text-primary shadow-float transition-transform hover:scale-[1.02]"
          >
            <UtensilsCrossed className="h-5 w-5" /> Ver cardápio
          </Link>

          <ul className="mt-4 grid w-full gap-3 text-left sm:grid-cols-3">
            {[
              { icon: Clock, label: "Horário", value: restaurant.openingHours },
              { icon: Truck, label: "Entrega", value: "R$ 2,00 a cada 2 km" },
              { icon: ShieldCheck, label: "Pagamento", value: "PIX, cartão ou dinheiro" },
            ].map((item) => (
              <li
                key={item.label}
                className="rounded-2xl bg-card/12 p-4 backdrop-blur-sm"
              >
                <item.icon className="h-5 w-5 text-primary-foreground" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-primary-foreground">{item.value}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-1 text-sm text-primary-foreground/80">
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {restaurant.address}
            </p>
            <p className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" /> {restaurant.phone}
            </p>
          </div>

          <Link
            to="/restaurante"
            className="text-sm font-semibold text-primary-foreground/75 underline-offset-4 hover:underline"
          >
            Acessar painel do restaurante
          </Link>
        </div>
      </div>
    </div>
  );
}

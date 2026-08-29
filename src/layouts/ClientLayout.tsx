import { Link, useRouterState } from "@tanstack/react-router";
import {
  Clock,
  Home,
  MapPin,
  Receipt,
  ShoppingBag,
  User,
  UtensilsCrossed,
} from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "@/store/app-store";
import { isOpenNow } from "@/config/restaurant";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { to: "/historico", label: "Pedidos", icon: Receipt },
  { to: "/enderecos", label: "Endereços", icon: MapPin },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function ClientLayout({
  children,
  showSearch,
}: {
  children: ReactNode;
  showSearch?: ReactNode;
}) {
  const { restaurant, cartCount } = useApp();
  const open = isOpenNow(restaurant);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={restaurant.logo}
              alt={`Logo do ${restaurant.name}`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl bg-primary-soft p-1"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight text-foreground sm:text-base">
                {restaurant.name}
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-semibold",
                    open ? "text-success" : "text-destructive",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      open ? "bg-success" : "bg-destructive",
                    )}
                  />
                  {open ? "Aberto" : "Fechado"}
                </span>
                <span className="hidden items-center gap-1 sm:inline-flex">
                  <Clock className="h-3 w-3" /> {restaurant.openingHours}
                </span>
              </span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/perfil"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              aria-label="Perfil"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              to="/carrinho"
              className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-float transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-card px-1 text-xs font-bold text-primary">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
        {showSearch}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border bg-card md:hidden">
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-xs",
            pathname === "/" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Home className="h-5 w-5" />
          Início
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-xs",
              pathname.startsWith(item.to) ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <footer className="hidden border-t border-border bg-card py-6 md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-muted-foreground">
          <span>
            {restaurant.name} · {restaurant.address}
          </span>
          <span>{restaurant.phone}</span>
          <Link to="/restaurante" className="font-semibold text-primary">
            Painel do restaurante
          </Link>
        </div>
      </footer>
    </div>
  );
}

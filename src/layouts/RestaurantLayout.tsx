import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Menu,
  Settings,
  ShoppingBag,
  Store,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/restaurante", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/restaurante/pedidos", label: "Pedidos", icon: ShoppingBag, exact: false },
  { to: "/restaurante/cardapio", label: "Cardápio", icon: UtensilsCrossed, exact: false },
  { to: "/restaurante/estoque", label: "Estoque", icon: Boxes, exact: false },
  { to: "/restaurante/clientes", label: "Clientes", icon: Users, exact: false },
  { to: "/restaurante/relatorios", label: "Relatórios", icon: BarChart3, exact: false },
  { to: "/restaurante/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

export function RestaurantLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { restaurant } = useApp();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.to
          : pathname.startsWith(link.to);
        return (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <link.icon className="h-4.5 w-4.5" />
            {link.label}
          </Link>
        );
      })}
      <Link
        to="/"
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <Store className="h-4.5 w-4.5" />
        Ver loja do cliente
      </Link>
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
      <img
        src={restaurant.logo}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 rounded-lg bg-sidebar-accent p-1"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-sidebar-foreground">
          {restaurant.name}
        </p>
        <p className="text-xs text-sidebar-foreground/60">Painel administrativo</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 bg-sidebar lg:sticky lg:top-0 lg:block lg:h-screen">
        {brand}
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar">
            <div className="flex items-center justify-between pr-3">
              <div className="flex-1">{brand}</div>
              <button
                onClick={() => setOpen(false)}
                className="text-sidebar-foreground"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground lg:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground lg:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { currentUserIsAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/restaurante")({
  ssr: false,
  component: RestauranteGuard,
});

function RestauranteGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = pathname.startsWith("/restaurante/login");
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLogin) return;
    let active = true;
    setAllowed(null);
    currentUserIsAdmin().then((ok) => {
      if (!active) return;
      if (!ok) navigate({ to: "/restaurante/login", replace: true });
      else setAllowed(true);
    });
    return () => {
      active = false;
    };
  }, [isLogin, pathname, navigate]);

  if (isLogin) return <Outlet />;
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Verificando acesso…</p>
      </div>
    );
  }
  return <Outlet />;
}

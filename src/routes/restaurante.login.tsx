import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { currentUserIsAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/restaurante/login")({
  head: () => ({
    meta: [
      { title: "Entrar no painel — Sabor da Casa" },
      { name: "description", content: "Acesso restrito à equipe do restaurante." },
      { property: "og:title", content: "Entrar no painel — Sabor da Casa" },
      { property: "og:description", content: "Acesso restrito à equipe do restaurante." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }
    const ok = await currentUserIsAdmin();
    if (!ok) {
      await supabase.auth.signOut();
      setError("Esse usuário não tem acesso ao painel.");
      setLoading(false);
      return;
    }
    navigate({ to: "/restaurante" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="card-surface w-full max-w-sm space-y-4 p-6">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Painel do restaurante</h1>
          <p className="text-sm text-muted-foreground">Entre com sua conta de funcionário.</p>
        </div>
        <label className="block text-sm font-medium text-foreground">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2"
          />
        </label>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

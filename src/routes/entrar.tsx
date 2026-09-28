import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ClientLayout } from "@/layouts/ClientLayout";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — Sabor da Casa" },
      { name: "description", content: "Entre na sua conta para salvar endereços e acompanhar pedidos." },
      { property: "og:title", content: "Entrar ou criar conta — Sabor da Casa" },
      { property: "og:description", content: "Acesse sua conta de cliente do Sabor da Casa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) return setError("E-mail ou senha inválidos.");
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/cardapio" });
      return;
    }
    if (password.length < 6) {
      setLoading(false);
      return setError("A senha precisa ter pelo menos 6 caracteres.");
    }
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { name, phone } },
    });
    setLoading(false);
    if (err) return setError(err.message);
    if (data.session) {
      toast.success("Conta criada!");
      navigate({ to: "/cardapio" });
    } else setSent(true);
  }

  const input = "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5";

  return (
    <ClientLayout>
      <div className="mx-auto max-w-sm">
        {sent ? (
          <div className="card-surface space-y-2 p-6 text-center">
            <h1 className="text-xl font-extrabold text-foreground">Confirme seu e-mail</h1>
            <p className="text-sm text-muted-foreground">
              Enviamos um link para <b>{email}</b>. Clique nele para ativar sua conta e depois entre aqui.
            </p>
            <button onClick={() => { setSent(false); setMode("login"); }} className="mt-2 text-sm font-bold text-primary">
              Voltar para entrar
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card-surface space-y-4 p-6">
            <h1 className="text-xl font-extrabold text-foreground">
              {mode === "login" ? "Entrar na sua conta" : "Criar conta"}
            </h1>
            {mode === "signup" && (
              <>
                <label className="block text-sm font-medium">
                  Nome
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
                </label>
                <label className="block text-sm font-medium">
                  Telefone
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
                </label>
              </>
            )}
            <label className="block text-sm font-medium">
              E-mail
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            </label>
            <label className="block text-sm font-medium">
              Senha
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            </label>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground disabled:opacity-60">
              {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              className="w-full text-sm font-semibold text-primary"
            >
              {mode === "login" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
            </button>
          </form>
        )}
      </div>
    </ClientLayout>
  );
}

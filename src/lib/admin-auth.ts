import { supabase } from "@/integrations/supabase/client";

/**
 * Retorna true se o usuário logado tem o papel "admin".
 * Usa a função has_role no banco (security definer), que só é
 * executável por usuários autenticados.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supabase.rpc("has_role", { _role: "admin" });
  if (error) return false;
  return data === true;
}

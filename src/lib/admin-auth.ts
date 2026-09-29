import { supabase } from "@/integrations/supabase/client";

/**
 * Retorna true se o usuário logado tem o papel "admin".
 * Lê apenas o próprio papel (a regra do banco só mostra as linhas do próprio usuário).
 * É só para a interface: a proteção real dos dados está nas regras do banco.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}

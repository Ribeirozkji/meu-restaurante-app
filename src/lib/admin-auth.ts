import { supabase } from "@/integrations/supabase/client";

/** Retorna true se o usuário logado tem o papel "admin" em user_roles. */
export async function currentUserIsAdmin(): Promise<boolean> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

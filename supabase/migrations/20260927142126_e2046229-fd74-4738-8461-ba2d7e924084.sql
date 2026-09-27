ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.owns_customer(_customer_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.customers where id = _customer_id and user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.owns_customer(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.owns_customer(text) TO authenticated, service_role;

REVOKE ALL ON public.addresses FROM anon;

CREATE POLICY "cliente le seus enderecos" ON public.addresses FOR SELECT TO authenticated
  USING (customer_id IS NOT NULL AND public.owns_customer(customer_id));
CREATE POLICY "cliente cria seus enderecos" ON public.addresses FOR INSERT TO authenticated
  WITH CHECK (customer_id IS NOT NULL AND public.owns_customer(customer_id));
CREATE POLICY "cliente altera seus enderecos" ON public.addresses FOR UPDATE TO authenticated
  USING (customer_id IS NOT NULL AND public.owns_customer(customer_id))
  WITH CHECK (customer_id IS NOT NULL AND public.owns_customer(customer_id));
CREATE POLICY "cliente exclui seus enderecos" ON public.addresses FOR DELETE TO authenticated
  USING (customer_id IS NOT NULL AND public.owns_customer(customer_id));

CREATE POLICY "cliente le seu cadastro" ON public.customers FOR SELECT TO authenticated
  USING (user_id = auth.uid());
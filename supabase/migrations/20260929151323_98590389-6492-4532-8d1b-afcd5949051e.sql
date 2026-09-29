CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "admin gerencia enderecos" ON public.addresses;
DROP POLICY IF EXISTS "admin gerencia clientes" ON public.customers;
DROP POLICY IF EXISTS "admin gerencia pedidos" ON public.orders;
DROP POLICY IF EXISTS "admin gerencia produtos" ON public.products;
DROP POLICY IF EXISTS "admin gerencia configuracoes" ON public.restaurant_settings;
DROP POLICY IF EXISTS "admin gerencia estoque" ON public.stock_items;

CREATE POLICY "admin gerencia enderecos" ON public.addresses FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admin gerencia clientes" ON public.customers FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admin gerencia pedidos" ON public.orders FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admin gerencia produtos" ON public.products FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admin gerencia configuracoes" ON public.restaurant_settings FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));
CREATE POLICY "admin gerencia estoque" ON public.stock_items FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin')) WITH CHECK (private.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_order_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.code := 'PED-' || to_char(now() AT TIME ZONE 'America/Recife', 'YYYYMMDD') || '-' || lpad(nextval('public.order_code_seq')::text, 4, '0');
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    NEW.user_id := auth.uid();
    NEW.paid := false;
    NEW.status := 'novo';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_order_code() FROM public, anon, authenticated;

DROP FUNCTION IF EXISTS public.has_role(public.app_role);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
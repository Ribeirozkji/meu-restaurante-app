ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid();

CREATE SEQUENCE IF NOT EXISTS public.order_code_seq START 1000;
GRANT USAGE ON SEQUENCE public.order_code_seq TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_order_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.code := 'PED-' || to_char(now() AT TIME ZONE 'America/Recife', 'YYYYMMDD') || '-' || lpad(nextval('public.order_code_seq')::text, 4, '0');
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.user_id := auth.uid();
    NEW.paid := false;
    NEW.status := 'novo';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_order_code() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS orders_set_code ON public.orders;
CREATE TRIGGER orders_set_code BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_order_code();

DROP POLICY IF EXISTS "qualquer um cria pedido" ON public.orders;
REVOKE INSERT ON public.orders FROM anon;

CREATE POLICY "cliente cria seu pedido" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND paid = false AND status = 'novo'
    AND (customer_id IS NULL OR public.owns_customer(customer_id)));
CREATE POLICY "cliente le seus pedidos" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());
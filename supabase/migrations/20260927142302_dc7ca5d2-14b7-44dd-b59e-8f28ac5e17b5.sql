CREATE POLICY "cliente cria seu cadastro" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "cliente altera seu cadastro" ON public.customers FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY "publico le configuracoes" ON public.restaurant_settings;
CREATE POLICY "publico le configuracoes" ON public.restaurant_settings
  FOR SELECT TO anon, authenticated
  USING (id = 1);
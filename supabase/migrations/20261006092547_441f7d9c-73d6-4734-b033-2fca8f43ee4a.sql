CREATE OR REPLACE FUNCTION public.check_restaurant_open()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; h int;
BEGIN
  IF private.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  SELECT open_from, open_to INTO s FROM public.restaurant_settings WHERE id = 1;
  IF s IS NULL THEN RETURN NEW; END IF;
  h := extract(hour from now() AT TIME ZONE 'America/Recife')::int;
  IF NOT (h >= s.open_from AND h < s.open_to) THEN
    RAISE EXCEPTION 'Restaurante fechado no momento';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.check_restaurant_open() FROM public, anon, authenticated;
DROP TRIGGER IF EXISTS orders_check_open ON public.orders;
CREATE TRIGGER orders_check_open BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.check_restaurant_open();
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
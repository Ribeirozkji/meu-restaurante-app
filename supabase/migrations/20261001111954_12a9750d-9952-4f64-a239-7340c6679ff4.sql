CREATE OR REPLACE FUNCTION public.set_order_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  item jsonb;
  prod record;
  addon_id text;
  addon jsonb;
  unit_price numeric(10,2);
  computed_subtotal numeric(10,2) := 0;
  computed_fee numeric(10,2);
  settings record;
BEGIN
  NEW.code := 'PED-' || to_char(now() AT TIME ZONE 'America/Recife', 'YYYYMMDD') || '-' || lpad(nextval('public.order_code_seq')::text, 4, '0');

  IF private.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  NEW.user_id := auth.uid();
  NEW.paid := false;
  NEW.status := 'novo';

  IF NEW.items IS NULL OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Pedido sem itens';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    SELECT * INTO prod FROM public.products
      WHERE id = (item->>'productId') AND available = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto indisponível ou inexistente: %', item->>'productId';
    END IF;

    unit_price := prod.price;

    IF jsonb_typeof(item->'addons') = 'array' THEN
      FOR addon_id IN SELECT jsonb_array_elements_text(item->'addons')
      LOOP
        SELECT value INTO addon FROM jsonb_array_elements(prod.addons) AS value
          WHERE value->>'id' = addon_id;
        IF addon IS NULL THEN
          RAISE EXCEPTION 'Adicional inválido para o produto %: %', prod.id, addon_id;
        END IF;
        unit_price := unit_price + COALESCE((addon->>'price')::numeric, 0);
      END LOOP;
    END IF;

    computed_subtotal := computed_subtotal + (unit_price * GREATEST(COALESCE((item->>'quantity')::int, 1), 1));
  END LOOP;

  SELECT * INTO settings FROM public.restaurant_settings WHERE id = 1;
  IF settings IS NULL OR COALESCE(settings.delivery_block_km, 0) = 0 THEN
    computed_fee := 0;
  ELSE
    computed_fee := CEIL(GREATEST(COALESCE(NEW.distance_km, 0), 0) / settings.delivery_block_km) * settings.delivery_fee_per_block;
  END IF;

  NEW.subtotal := computed_subtotal;
  NEW.delivery_fee := computed_fee;
  NEW.total := computed_subtotal + computed_fee;

  RETURN NEW;
END $$;

REVOKE EXECUTE ON FUNCTION public.set_order_code() FROM public, anon, authenticated;
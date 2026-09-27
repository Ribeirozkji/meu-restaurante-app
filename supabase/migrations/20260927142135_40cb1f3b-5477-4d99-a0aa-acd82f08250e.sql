CREATE OR REPLACE FUNCTION public.owns_customer(_customer_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  select exists (select 1 from public.customers where id = _customer_id and user_id = auth.uid());
$$;
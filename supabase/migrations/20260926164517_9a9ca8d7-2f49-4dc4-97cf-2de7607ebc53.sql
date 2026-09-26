create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

revoke insert, update, delete on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

create policy "usuario le seus proprios papeis"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.has_role(_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = _role
  );
$$;

grant execute on function public.has_role(public.app_role) to anon, authenticated;

drop policy "demo open access" on public.restaurant_settings;
drop policy "demo open access" on public.products;
drop policy "demo open access" on public.stock_items;
drop policy "demo open access" on public.customers;
drop policy "demo open access" on public.addresses;
drop policy "demo open access" on public.orders;

revoke all on public.restaurant_settings from anon, authenticated;
revoke all on public.products            from anon, authenticated;
revoke all on public.stock_items         from anon, authenticated;
revoke all on public.customers           from anon, authenticated;
revoke all on public.addresses           from anon, authenticated;
revoke all on public.orders              from anon, authenticated;

grant select on public.restaurant_settings to anon, authenticated;
grant select on public.products            to anon, authenticated;
grant insert on public.orders              to anon, authenticated;
grant select, update, delete on public.orders to authenticated;

grant all on public.restaurant_settings, public.products, public.stock_items,
           public.customers, public.orders, public.addresses to service_role;

create policy "publico le configuracoes"
  on public.restaurant_settings for select
  to anon, authenticated using (true);

create policy "admin gerencia configuracoes"
  on public.restaurant_settings for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "publico le produtos"
  on public.products for select
  to anon, authenticated using (true);

create policy "admin gerencia produtos"
  on public.products for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "admin gerencia estoque"
  on public.stock_items for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "admin gerencia clientes"
  on public.customers for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

create policy "qualquer um cria pedido"
  on public.orders for insert
  to anon, authenticated
  with check (
    paid = false
    and status = 'novo'
  );

create policy "admin gerencia pedidos"
  on public.orders for all
  to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

comment on table public.orders is
  'INSERT liberado pra checkout (anon/authenticated). SELECT/UPDATE/DELETE '
  'restritos a admin. Leitura do proprio pedido pelo cliente (historico, '
  'acompanhar pedido) volta via funcao dedicada na Fase 3/4.';

comment on table public.addresses is
  'Sem RLS liberada pro client ainda — depende da Fase 4 (identidade real '
  'do cliente). Hoje toda a app usa um customer_id fixo, entao nao ha '
  '"dono" real do endereco pra restringir.';
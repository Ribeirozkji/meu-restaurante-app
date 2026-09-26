-- 1. Função de papel: assinatura canônica + variante conveniente, sem exposição a anônimos
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create or replace function public.has_role(_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), _role);
$$;

revoke all on function public.has_role(public.app_role) from public, anon;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(public.app_role) to authenticated, service_role;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

-- 2. user_roles: nenhum acesso para anônimos
revoke all on public.user_roles from anon;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

-- 3. Privilégios por tabela, alinhados às políticas
revoke all on public.restaurant_settings from anon, authenticated;
revoke all on public.products            from anon, authenticated;
revoke all on public.stock_items         from anon, authenticated;
revoke all on public.customers           from anon, authenticated;
revoke all on public.addresses           from anon, authenticated;
revoke all on public.orders              from anon, authenticated;

-- leitura pública apenas do que é vitrine
grant select on public.restaurant_settings to anon, authenticated;
grant select on public.products            to anon, authenticated;

-- checkout público cria pedido (RLS restringe o conteúdo)
grant insert on public.orders to anon, authenticated;

-- admin logado opera o painel (RLS exige o papel admin)
grant select, insert, update, delete on public.orders              to authenticated;
grant select, insert, update, delete on public.products            to authenticated;
grant select, insert, update, delete on public.stock_items         to authenticated;
grant select, insert, update, delete on public.customers           to authenticated;
grant select, insert, update, delete on public.addresses           to authenticated;
grant select, insert, update, delete on public.restaurant_settings to authenticated;

grant all on public.restaurant_settings, public.products, public.stock_items,
             public.customers, public.orders, public.addresses to service_role;

-- 4. Políticas reescritas com a assinatura canônica
drop policy if exists "publico le configuracoes" on public.restaurant_settings;
drop policy if exists "admin gerencia configuracoes" on public.restaurant_settings;
drop policy if exists "publico le produtos" on public.products;
drop policy if exists "admin gerencia produtos" on public.products;
drop policy if exists "admin gerencia estoque" on public.stock_items;
drop policy if exists "admin gerencia clientes" on public.customers;
drop policy if exists "qualquer um cria pedido" on public.orders;
drop policy if exists "admin gerencia pedidos" on public.orders;

create policy "publico le configuracoes"
  on public.restaurant_settings for select
  to anon, authenticated using (true);

create policy "admin gerencia configuracoes"
  on public.restaurant_settings for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "publico le produtos"
  on public.products for select
  to anon, authenticated using (true);

create policy "admin gerencia produtos"
  on public.products for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin gerencia estoque"
  on public.stock_items for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin gerencia clientes"
  on public.customers for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "admin gerencia enderecos"
  on public.addresses for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "qualquer um cria pedido"
  on public.orders for insert
  to anon, authenticated
  with check (paid = false and status = 'novo');

create policy "admin gerencia pedidos"
  on public.orders for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

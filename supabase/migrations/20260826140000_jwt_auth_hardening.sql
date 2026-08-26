-- Supabase Auth valida o JWT recebido em cada chamada e expõe os dados em auth.*.
-- A tabela admin_users permanece como fonte de autorização para que a remoção do
-- acesso administrativo tenha efeito imediato, sem depender da expiração do token.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (select auth.uid()) is not null
    and (select auth.jwt() ->> 'role') = 'authenticated'
    and exists (
      select 1
      from public.admin_users
      where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

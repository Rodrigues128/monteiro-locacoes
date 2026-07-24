create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  recommended_age text not null default 'Livre',
  size text not null default 'Consultar',
  allows_water boolean not null default false,
  capacity text not null default 'Consultar',
  price numeric(10,2),
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists gallery_images_set_updated_at on public.gallery_images;
create trigger gallery_images_set_updated_at before update on public.gallery_images for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.gallery_images enable row level security;

create policy "admins read own admin record" on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy "public reads active products" on public.products for select using (active or public.is_admin());
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public reads active gallery images" on public.gallery_images for select using (active or public.is_admin());
create policy "admins manage gallery images" on public.gallery_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('catalog', 'catalog', true) on conflict (id) do nothing;
create policy "public reads catalog images" on storage.objects for select using (bucket_id = 'catalog');
create policy "admins upload catalog images" on storage.objects for insert to authenticated with check (bucket_id = 'catalog' and public.is_admin());
create policy "admins update catalog images" on storage.objects for update to authenticated using (bucket_id = 'catalog' and public.is_admin()) with check (bucket_id = 'catalog' and public.is_admin());
create policy "admins delete catalog images" on storage.objects for delete to authenticated using (bucket_id = 'catalog' and public.is_admin());

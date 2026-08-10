-- Execute este arquivo no SQL Editor do Supabase após schema.sql.
-- Ele é seguro para executar mais de uma vez.

alter table public.admin_users force row level security;
alter table public.products force row level security;
alter table public.gallery_images force row level security;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
revoke all on public.products from anon;
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
revoke all on public.gallery_images from anon;
grant select on public.gallery_images to anon;
grant select, insert, update, delete on public.gallery_images to authenticated;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read own admin record" on public.admin_users;
drop policy if exists "public reads active products" on public.products;
drop policy if exists "admins manage products" on public.products;
drop policy if exists "public reads active gallery images" on public.gallery_images;
drop policy if exists "admins manage gallery images" on public.gallery_images;

create policy "admins read own admin record"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create policy "public reads active products"
on public.products for select to anon, authenticated
using (active or public.is_admin());

create policy "admins manage products"
on public.products for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "public reads active gallery images"
on public.gallery_images for select to anon, authenticated
using (active or public.is_admin());

create policy "admins manage gallery images"
on public.gallery_images for all to authenticated
using (public.is_admin())
with check (public.is_admin());

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_price_non_negative') then
    alter table public.products add constraint products_price_non_negative check (price is null or price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_features_array') then
    alter table public.products add constraint products_features_array check (jsonb_typeof(features) = 'array');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_image_path') then
    alter table public.products add constraint products_image_path check (image_path is null or image_path ~ '^products/[a-z0-9-]+\.(jpg|jpeg|png|webp)$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'gallery_image_path') then
    alter table public.gallery_images add constraint gallery_image_path check (image_path ~ '^gallery/[a-z0-9-]+\.(jpg|jpeg|png|webp)$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'gallery_sort_order_non_negative') then
    alter table public.gallery_images add constraint gallery_sort_order_non_negative check (sort_order >= 0);
  end if;
end $$;

update storage.buckets
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'catalog';

drop policy if exists "public reads catalog images" on storage.objects;
drop policy if exists "admins upload catalog images" on storage.objects;
drop policy if exists "admins update catalog images" on storage.objects;
drop policy if exists "admins delete catalog images" on storage.objects;

create policy "public reads catalog images"
on storage.objects for select
using (bucket_id = 'catalog');

create policy "admins upload catalog images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'catalog'
  and public.is_admin()
  and (storage.foldername(name))[1] in ('products', 'gallery')
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

create policy "admins update catalog images"
on storage.objects for update to authenticated
using (bucket_id = 'catalog' and public.is_admin())
with check (
  bucket_id = 'catalog'
  and public.is_admin()
  and (storage.foldername(name))[1] in ('products', 'gallery')
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

create policy "admins delete catalog images"
on storage.objects for delete to authenticated
using (bucket_id = 'catalog' and public.is_admin());

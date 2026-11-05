-- =============================================================================
-- Royal Perfume Hub tenant
-- =============================================================================
-- Creates an isolated tenant with the suffix `_royal_perfume_hub`.
-- Clones the derme structure, adds hardened RLS, a tenant-aware auth trigger,
-- storage buckets, settings, categories (including the seven perfume types),
-- delivery zones, taxes, notification templates, and the derme catalogue.
--
-- This migration is idempotent enough to re-run after a partial failure.
-- It does NOT alter derme data except for replacing the shared auth trigger
-- with a store-aware router (approved).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Tables (structure cloned from derme)
-- -----------------------------------------------------------------------------
create table if not exists public.categories_royal_perfume_hub
  (like public.categories_perfume_store including all);
create table if not exists public.delivery_zones_royal_perfume_hub
  (like public.delivery_zones_perfume_store including all);
create table if not exists public.inventory_master_royal_perfume_hub
  (like public.inventory_master_perfume_store including all);
create table if not exists public.marketing_campaigns_royal_perfume_hub
  (like public.marketing_campaigns_perfume_store including all);
create table if not exists public.notification_templates_royal_perfume_hub
  (like public.notification_templates_perfume_store including all);
create table if not exists public.order_items_royal_perfume_hub
  (like public.order_items_perfume_store including all);
create table if not exists public.orders_royal_perfume_hub
  (like public.orders_perfume_store including all);
create table if not exists public.payments_royal_perfume_hub
  (like public.payments_perfume_store including all);
create table if not exists public.posts_royal_perfume_hub
  (like public.posts_perfume_store including all);
create table if not exists public.product_reviews_royal_perfume_hub
  (like public.product_reviews_perfume_store including all);
create table if not exists public.product_variants_royal_perfume_hub
  (like public.product_variants_perfume_store including all);
create table if not exists public.products_royal_perfume_hub
  (like public.products_perfume_store including all);
create table if not exists public.profiles_royal_perfume_hub
  (like public.profiles_perfume_store including all);
create table if not exists public.sms_logs_royal_perfume_hub
  (like public.sms_logs_perfume_store including all);
create table if not exists public.store_settings_royal_perfume_hub
  (like public.store_settings_perfume_store including all);
create table if not exists public.taxes_royal_perfume_hub
  (like public.taxes_perfume_store including all);

-- Order numbers must use Royal's own sequence, never derme's.
create sequence if not exists public.orders_royal_perfume_hub_order_number_seq;
alter sequence public.orders_royal_perfume_hub_order_number_seq
  owned by public.orders_royal_perfume_hub.order_number;
alter table public.orders_royal_perfume_hub
  alter column order_number set default nextval('public.orders_royal_perfume_hub_order_number_seq'::regclass);

-- Royal-specific defaults.
alter table public.profiles_royal_perfume_hub
  alter column role set default 'customer';
alter table public.store_settings_royal_perfume_hub
  alter column support_email set default null;
alter table public.store_settings_royal_perfume_hub
  alter column primary_phone set default '0593448658';
alter table public.store_settings_royal_perfume_hub
  alter column whatsapp_phone set default '233593448658';

-- Useful uniqueness that derme lacks.
create unique index if not exists categories_royal_perfume_hub_slug_key
  on public.categories_royal_perfume_hub (slug);
create unique index if not exists products_royal_perfume_hub_slug_key
  on public.products_royal_perfume_hub (slug);

-- Only Gift Sets are bundles. Game Day was removed.
update public.products_royal_perfume_hub
set set_type = null
where set_type = 'game-day';
delete from public.categories_royal_perfume_hub where slug = 'game-day';
alter table public.products_royal_perfume_hub
  drop constraint if exists products_perfume_store_set_type_check;
alter table public.products_royal_perfume_hub
  drop constraint if exists products_royal_perfume_hub_set_type_check;
alter table public.products_royal_perfume_hub
  add constraint products_royal_perfume_hub_set_type_check
  check (set_type is null or set_type = 'gift-set');

-- -----------------------------------------------------------------------------
-- 2. Foreign keys (LIKE does not copy them)
-- -----------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('categories_royal_perfume_hub', 'categories_royal_perfume_hub_parent_id_fkey',
       'foreign key (parent_id) references public.categories_royal_perfume_hub(id) on delete set null'),
      ('products_royal_perfume_hub', 'products_royal_perfume_hub_category_id_fkey',
       'foreign key (category_id) references public.categories_royal_perfume_hub(id) on delete set null'),
      ('product_variants_royal_perfume_hub', 'product_variants_royal_perfume_hub_product_id_fkey',
       'foreign key (product_id) references public.products_royal_perfume_hub(id) on delete cascade'),
      ('product_variants_royal_perfume_hub', 'product_variants_royal_perfume_hub_master_stock_id_fkey',
       'foreign key (master_stock_id) references public.inventory_master_royal_perfume_hub(id)'),
      ('orders_royal_perfume_hub', 'orders_royal_perfume_hub_user_id_fkey',
       'foreign key (user_id) references auth.users(id) on delete set null'),
      ('orders_royal_perfume_hub', 'orders_royal_perfume_hub_delivery_zone_id_fkey',
       'foreign key (delivery_zone_id) references public.delivery_zones_royal_perfume_hub(id) on delete set null'),
      ('order_items_royal_perfume_hub', 'order_items_royal_perfume_hub_order_id_fkey',
       'foreign key (order_id) references public.orders_royal_perfume_hub(id) on delete cascade'),
      ('product_reviews_royal_perfume_hub', 'product_reviews_royal_perfume_hub_product_id_fkey',
       'foreign key (product_id) references public.products_royal_perfume_hub(id) on delete cascade'),
      ('product_reviews_royal_perfume_hub', 'product_reviews_royal_perfume_hub_user_id_fkey',
       'foreign key (user_id) references auth.users(id) on delete cascade'),
      ('profiles_royal_perfume_hub', 'profiles_royal_perfume_hub_id_fkey',
       'foreign key (id) references auth.users(id) on delete cascade')
    ) as v(tbl, cname, def)
  loop
    if not exists (
      select 1 from pg_constraint
      where conname = r.cname and conrelid = r.tbl::regclass
    ) then
      execute format('alter table public.%I add constraint %I %s', r.tbl, r.cname, r.def);
    end if;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Functions
-- -----------------------------------------------------------------------------
create or replace function public.is_super_admin_royal_perfume_hub()
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $fn$
begin
  return exists (
    select 1 from public.profiles_royal_perfume_hub
    where id = auth.uid() and role = 'super_admin'
  );
end;
$fn$;

-- Force every Royal order/payment row to carry the Royal slug.
create or replace function public.enforce_royal_store_slug()
returns trigger
language plpgsql
as $fn$
begin
  new.store_slug := 'royal-perfume-hub';
  return new;
end;
$fn$;

drop trigger if exists enforce_royal_store_slug_orders on public.orders_royal_perfume_hub;
create trigger enforce_royal_store_slug_orders
  before insert or update on public.orders_royal_perfume_hub
  for each row execute function public.enforce_royal_store_slug();

drop trigger if exists enforce_royal_store_slug_payments on public.payments_royal_perfume_hub;
create trigger enforce_royal_store_slug_payments
  before insert or update on public.payments_royal_perfume_hub
  for each row execute function public.enforce_royal_store_slug();

-- Store-aware signup router. Replaces the derme-only trigger so a signup on
-- one storefront never creates a profile in another store.
create or replace function public.handle_new_user_jarayel()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $fn$
declare
  store_slug text;
begin
  store_slug := coalesce(new.raw_user_meta_data->>'store_slug', 'derme');

  if store_slug = 'royal-perfume-hub' then
    insert into public.profiles_royal_perfume_hub (id, email, role)
    values (new.id, new.email, 'customer')
    on conflict (id) do nothing;
  elsif store_slug = 'play-time' then
    insert into public.profiles_toy_shop (id, email, role)
    values (new.id, new.email, 'customer')
    on conflict (id) do nothing;
  else
    insert into public.profiles_perfume_store (id, email, role)
    values (new.id, new.email, 'customer')
    on conflict (id) do nothing;
  end if;

  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created_perfume_store on auth.users;
drop trigger if exists on_auth_user_created_jarayel on auth.users;
create trigger on_auth_user_created_jarayel
  after insert on auth.users
  for each row execute function public.handle_new_user_jarayel();

-- -----------------------------------------------------------------------------
-- 4. RLS
-- -----------------------------------------------------------------------------
alter table public.categories_royal_perfume_hub enable row level security;
alter table public.delivery_zones_royal_perfume_hub enable row level security;
alter table public.inventory_master_royal_perfume_hub enable row level security;
alter table public.marketing_campaigns_royal_perfume_hub enable row level security;
alter table public.notification_templates_royal_perfume_hub enable row level security;
alter table public.order_items_royal_perfume_hub enable row level security;
alter table public.orders_royal_perfume_hub enable row level security;
alter table public.payments_royal_perfume_hub enable row level security;
alter table public.posts_royal_perfume_hub enable row level security;
alter table public.product_reviews_royal_perfume_hub enable row level security;
alter table public.product_variants_royal_perfume_hub enable row level security;
alter table public.products_royal_perfume_hub enable row level security;
alter table public.profiles_royal_perfume_hub enable row level security;
alter table public.sms_logs_royal_perfume_hub enable row level security;
alter table public.store_settings_royal_perfume_hub enable row level security;
alter table public.taxes_royal_perfume_hub enable row level security;

-- Categories
drop policy if exists "Royal public read categories" on public.categories_royal_perfume_hub;
create policy "Royal public read categories" on public.categories_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal admins manage categories" on public.categories_royal_perfume_hub;
create policy "Royal admins manage categories" on public.categories_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Delivery zones
drop policy if exists "Royal public read zones" on public.delivery_zones_royal_perfume_hub;
create policy "Royal public read zones" on public.delivery_zones_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal admins manage zones" on public.delivery_zones_royal_perfume_hub;
create policy "Royal admins manage zones" on public.delivery_zones_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Taxes
drop policy if exists "Royal public read taxes" on public.taxes_royal_perfume_hub;
create policy "Royal public read taxes" on public.taxes_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal admins manage taxes" on public.taxes_royal_perfume_hub;
create policy "Royal admins manage taxes" on public.taxes_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Store settings (public read is required by footer/contact/checkout)
drop policy if exists "Royal public read settings" on public.store_settings_royal_perfume_hub;
create policy "Royal public read settings" on public.store_settings_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal admins manage settings" on public.store_settings_royal_perfume_hub;
create policy "Royal admins manage settings" on public.store_settings_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Notification templates (read by the server-side notification engine)
drop policy if exists "Royal public read templates" on public.notification_templates_royal_perfume_hub;
create policy "Royal public read templates" on public.notification_templates_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal admins manage templates" on public.notification_templates_royal_perfume_hub;
create policy "Royal admins manage templates" on public.notification_templates_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Products
drop policy if exists "Royal public read active products" on public.products_royal_perfume_hub;
create policy "Royal public read active products" on public.products_royal_perfume_hub
  for select to public using (is_active = true);
drop policy if exists "Royal admins manage products" on public.products_royal_perfume_hub;
create policy "Royal admins manage products" on public.products_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Product variants
drop policy if exists "Royal public read variants" on public.product_variants_royal_perfume_hub;
create policy "Royal public read variants" on public.product_variants_royal_perfume_hub
  for select to public using (
    exists (
      select 1 from public.products_royal_perfume_hub p
      where p.id = product_id and p.is_active = true
    )
  );
drop policy if exists "Royal admins manage variants" on public.product_variants_royal_perfume_hub;
create policy "Royal admins manage variants" on public.product_variants_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Inventory
drop policy if exists "Royal public read inventory" on public.inventory_master_royal_perfume_hub;
create policy "Royal public read inventory" on public.inventory_master_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal admins manage inventory" on public.inventory_master_royal_perfume_hub;
create policy "Royal admins manage inventory" on public.inventory_master_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Blog posts
drop policy if exists "Royal public read published posts" on public.posts_royal_perfume_hub;
create policy "Royal public read published posts" on public.posts_royal_perfume_hub
  for select to public using (is_published = true);
drop policy if exists "Royal admins manage posts" on public.posts_royal_perfume_hub;
create policy "Royal admins manage posts" on public.posts_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Campaigns
drop policy if exists "Royal public read active campaigns" on public.marketing_campaigns_royal_perfume_hub;
create policy "Royal public read active campaigns" on public.marketing_campaigns_royal_perfume_hub
  for select to public using (is_active = true);
drop policy if exists "Royal admins manage campaigns" on public.marketing_campaigns_royal_perfume_hub;
create policy "Royal admins manage campaigns" on public.marketing_campaigns_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Reviews
drop policy if exists "Royal public read reviews" on public.product_reviews_royal_perfume_hub;
create policy "Royal public read reviews" on public.product_reviews_royal_perfume_hub
  for select to public using (true);
drop policy if exists "Royal users create own reviews" on public.product_reviews_royal_perfume_hub;
create policy "Royal users create own reviews" on public.product_reviews_royal_perfume_hub
  for insert to public with check (auth.uid() = user_id);
drop policy if exists "Royal users update own reviews" on public.product_reviews_royal_perfume_hub;
create policy "Royal users update own reviews" on public.product_reviews_royal_perfume_hub
  for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Royal users delete own reviews" on public.product_reviews_royal_perfume_hub;
create policy "Royal users delete own reviews" on public.product_reviews_royal_perfume_hub
  for delete to public using (auth.uid() = user_id);
drop policy if exists "Royal admins manage reviews" on public.product_reviews_royal_perfume_hub;
create policy "Royal admins manage reviews" on public.product_reviews_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Profiles
drop policy if exists "Royal users read own profile" on public.profiles_royal_perfume_hub;
create policy "Royal users read own profile" on public.profiles_royal_perfume_hub
  for select to public using (auth.uid() = id);
drop policy if exists "Royal admins manage profiles" on public.profiles_royal_perfume_hub;
create policy "Royal admins manage profiles" on public.profiles_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Orders
drop policy if exists "Royal anyone create orders" on public.orders_royal_perfume_hub;
create policy "Royal anyone create orders" on public.orders_royal_perfume_hub
  for insert to public with check (true);
drop policy if exists "Royal users read own orders" on public.orders_royal_perfume_hub;
create policy "Royal users read own orders" on public.orders_royal_perfume_hub
  for select to public using (auth.uid() = user_id);
drop policy if exists "Royal admins manage orders" on public.orders_royal_perfume_hub;
create policy "Royal admins manage orders" on public.orders_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Order items
drop policy if exists "Royal anyone create order items" on public.order_items_royal_perfume_hub;
create policy "Royal anyone create order items" on public.order_items_royal_perfume_hub
  for insert to public with check (true);
drop policy if exists "Royal users read own order items" on public.order_items_royal_perfume_hub;
create policy "Royal users read own order items" on public.order_items_royal_perfume_hub
  for select to public using (
    exists (
      select 1 from public.orders_royal_perfume_hub o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
drop policy if exists "Royal admins manage order items" on public.order_items_royal_perfume_hub;
create policy "Royal admins manage order items" on public.order_items_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- Payments (server/service-role only)
drop policy if exists "Royal admins manage payments" on public.payments_royal_perfume_hub;
create policy "Royal admins manage payments" on public.payments_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- SMS logs
drop policy if exists "Royal admins read sms logs" on public.sms_logs_royal_perfume_hub;
create policy "Royal admins read sms logs" on public.sms_logs_royal_perfume_hub
  for select to public using (public.is_super_admin_royal_perfume_hub());
drop policy if exists "Royal admins manage sms logs" on public.sms_logs_royal_perfume_hub;
create policy "Royal admins manage sms logs" on public.sms_logs_royal_perfume_hub
  for all to public using (public.is_super_admin_royal_perfume_hub())
  with check (public.is_super_admin_royal_perfume_hub());

-- -----------------------------------------------------------------------------
-- 5. Grants (RLS still decides access)
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on table
  public.categories_royal_perfume_hub,
  public.delivery_zones_royal_perfume_hub,
  public.inventory_master_royal_perfume_hub,
  public.marketing_campaigns_royal_perfume_hub,
  public.notification_templates_royal_perfume_hub,
  public.posts_royal_perfume_hub,
  public.product_reviews_royal_perfume_hub,
  public.product_variants_royal_perfume_hub,
  public.products_royal_perfume_hub,
  public.store_settings_royal_perfume_hub,
  public.taxes_royal_perfume_hub
to anon, authenticated;

grant insert on table
  public.orders_royal_perfume_hub,
  public.order_items_royal_perfume_hub
to anon, authenticated;

grant select, insert, update, delete on table
  public.orders_royal_perfume_hub,
  public.order_items_royal_perfume_hub,
  public.profiles_royal_perfume_hub,
  public.payments_royal_perfume_hub,
  public.sms_logs_royal_perfume_hub
to authenticated;

grant insert, update, delete on table
  public.categories_royal_perfume_hub,
  public.delivery_zones_royal_perfume_hub,
  public.inventory_master_royal_perfume_hub,
  public.marketing_campaigns_royal_perfume_hub,
  public.notification_templates_royal_perfume_hub,
  public.posts_royal_perfume_hub,
  public.product_reviews_royal_perfume_hub,
  public.product_variants_royal_perfume_hub,
  public.products_royal_perfume_hub,
  public.store_settings_royal_perfume_hub,
  public.taxes_royal_perfume_hub
to authenticated;

grant usage, select on sequence public.orders_royal_perfume_hub_order_number_seq
  to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. Storage
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images-royal-perfume-hub', 'product-images-royal-perfume-hub', true, 52428800, array['image/*']),
  ('blog-images-royal-perfume-hub', 'blog-images-royal-perfume-hub', true, 52428800, array['image/*']),
  ('marketing-assets-royal-perfume-hub', 'marketing-assets-royal-perfume-hub', true, 52428800, array['image/*'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Royal public read product images" on storage.objects;
create policy "Royal public read product images" on storage.objects
  for select to public using (bucket_id = 'product-images-royal-perfume-hub');
drop policy if exists "Royal admins upload product images" on storage.objects;
create policy "Royal admins upload product images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'product-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );
drop policy if exists "Royal admins update product images" on storage.objects;
create policy "Royal admins update product images" on storage.objects
  for update to authenticated using (
    bucket_id = 'product-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  ) with check (
    bucket_id = 'product-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );
drop policy if exists "Royal admins delete product images" on storage.objects;
create policy "Royal admins delete product images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'product-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );

drop policy if exists "Royal public read blog images" on storage.objects;
create policy "Royal public read blog images" on storage.objects
  for select to public using (bucket_id = 'blog-images-royal-perfume-hub');
drop policy if exists "Royal admins upload blog images" on storage.objects;
create policy "Royal admins upload blog images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'blog-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );
drop policy if exists "Royal admins update blog images" on storage.objects;
create policy "Royal admins update blog images" on storage.objects
  for update to authenticated using (
    bucket_id = 'blog-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  ) with check (
    bucket_id = 'blog-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );
drop policy if exists "Royal admins delete blog images" on storage.objects;
create policy "Royal admins delete blog images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'blog-images-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );

drop policy if exists "Royal public read marketing assets" on storage.objects;
create policy "Royal public read marketing assets" on storage.objects
  for select to public using (bucket_id = 'marketing-assets-royal-perfume-hub');
drop policy if exists "Royal admins upload marketing assets" on storage.objects;
create policy "Royal admins upload marketing assets" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketing-assets-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );
drop policy if exists "Royal admins update marketing assets" on storage.objects;
create policy "Royal admins update marketing assets" on storage.objects
  for update to authenticated using (
    bucket_id = 'marketing-assets-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  ) with check (
    bucket_id = 'marketing-assets-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );
drop policy if exists "Royal admins delete marketing assets" on storage.objects;
create policy "Royal admins delete marketing assets" on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketing-assets-royal-perfume-hub'
    and public.is_super_admin_royal_perfume_hub()
  );

-- -----------------------------------------------------------------------------
-- 7. Seed: settings
-- -----------------------------------------------------------------------------
insert into public.store_settings_royal_perfume_hub (
  id, whatsapp_phone, support_email, enable_outside_accra, enable_international,
  bulk_threshold, bulk_surcharge, master_sms_enabled, master_email_enabled,
  enable_admin_alerts, enable_customer_alerts, backup_admin_phone,
  enable_backup_phone, admin_alert_email, primary_phone
) values (
  1, '233593448658', null, false, false,
  10, 5, true, true,
  true, true, '0537681940',
  true, 'gofrance01@gmail.com', '0593448658'
)
on conflict (id) do update set
  whatsapp_phone = excluded.whatsapp_phone,
  support_email = excluded.support_email,
  enable_outside_accra = excluded.enable_outside_accra,
  enable_international = excluded.enable_international,
  bulk_threshold = excluded.bulk_threshold,
  bulk_surcharge = excluded.bulk_surcharge,
  master_sms_enabled = excluded.master_sms_enabled,
  master_email_enabled = excluded.master_email_enabled,
  enable_admin_alerts = excluded.enable_admin_alerts,
  enable_customer_alerts = excluded.enable_customer_alerts,
  backup_admin_phone = excluded.backup_admin_phone,
  enable_backup_phone = excluded.enable_backup_phone,
  admin_alert_email = excluded.admin_alert_email,
  primary_phone = excluded.primary_phone;

-- -----------------------------------------------------------------------------
-- 8. Seed: categories
--    Includes the seven Royal perfume types plus the shop departments used by
--    the existing storefront and bundle admin.
-- -----------------------------------------------------------------------------
insert into public.categories_royal_perfume_hub (name, slug)
select v.name, v.slug
from (values
  ('Extrait de Parfum', 'extrait-de-parfum'),
  ('Parfum', 'parfum'),
  ('Eau de Parfum', 'eau-de-parfum'),
  ('Eau de Toilette', 'eau-de-toilette'),
  ('Eau Fraiche', 'eau-fraiche'),
  ('Eau de Senteur', 'eau-de-senteur'),
  ('Splash', 'splash'),
  ('Men''s', 'mens'),
  ('Women''s', 'womens'),
  ('Unisex & Niche', 'unisex'),
  ('Body Mists', 'body-mists'),
  ('Gift Sets', 'gift-sets')
) as v(name, slug)
where not exists (
  select 1 from public.categories_royal_perfume_hub c where c.slug = v.slug
);

-- -----------------------------------------------------------------------------
-- 9. Seed: delivery zones and taxes
-- -----------------------------------------------------------------------------
insert into public.delivery_zones_royal_perfume_hub (name, region_category, base_price, is_active)
select v.name, v.region_category, v.base_price, true
from (values
  ('Haatso / Bohye', 'accra_subzone', 15::numeric),
  ('East Legon / Adjiringanor', 'accra_subzone', 25::numeric),
  ('Osu / Cantonments', 'accra_subzone', 15::numeric),
  ('Airport Residential', 'accra_subzone', 20::numeric),
  ('Spintex / Sakumono', 'accra_subzone', 30::numeric),
  ('Tema', 'accra_subzone', 40::numeric),
  ('Ashanti Region', 'regional', 100::numeric),
  ('Western Region', 'regional', 120::numeric)
) as v(name, region_category, base_price)
where not exists (
  select 1 from public.delivery_zones_royal_perfume_hub z where z.name = v.name
);

insert into public.taxes_royal_perfume_hub (name, rate_percent, is_active, priority)
select v.name, v.rate_percent, v.is_active, v.priority
from (values
  ('NHIL', 2.5::numeric, true, 1),
  ('GetFund', 2.5::numeric, true, 2),
  ('COVID-19 Levy', 1::numeric, false, 3),
  ('VAT', 15::numeric, true, 4)
) as v(name, rate_percent, is_active, priority)
where not exists (
  select 1 from public.taxes_royal_perfume_hub t where t.name = v.name
);

-- -----------------------------------------------------------------------------
-- 10. Seed: notification templates
-- -----------------------------------------------------------------------------
insert into public.notification_templates_royal_perfume_hub
  (trigger_id, name, sms_template, email_subject, email_body, is_active)
values
  (
    'new_order_admin',
    'Admin: New Order Received',
    $sms$New Royal Perfume Hub order #{{order_number}}! Amount: {{total}}. Customer: {{customer_name}}.$sms$,
    $subj$New Royal Perfume Hub Order: #{{order_number}}$subj$,
    $body$You have received a new order from {{customer_name}}. Total: {{total}}. Check the Royal Perfume Hub dashboard for details.$body$,
    true
  ),
  (
    'new_order_customer',
    'Customer: Order Confirmation',
    $sms$Hi {{customer_name}}, thanks for your order at Royal Perfume Hub! Total: {{total}}. We will contact you shortly.$sms$,
    $subj$Royal Perfume Hub Order Confirmation$subj$,
    $body$<h3>Thank you for your order!</h3><p>We have received your order at Royal Perfume Hub.</p>{{invoice_table}}$body$,
    true
  ),
  (
    'payment_received',
    'Customer: Payment Received',
    $sms$Payment received for Royal Perfume Hub order. We are processing it now.$sms$,
    $subj$Payment Confirmed - Royal Perfume Hub$subj$,
    $body$<p>We have received your payment of {{total}}. Your Royal Perfume Hub order is now being processed.</p>$body$,
    true
  ),
  (
    'status_dispatched',
    'Customer: Order Dispatched',
    $sms$Good news! Your Royal Perfume Hub order has been dispatched. Expect delivery soon.$sms$,
    $subj$Your Royal Perfume Hub Order is on the way$subj$,
    $body$<p>Your order has been dispatched and is making its way to you.</p>$body$,
    true
  ),
  (
    'status_delivered',
    'Customer: Order Delivered',
    $sms$Order delivered. Enjoy your fragrance! - Royal Perfume Hub$sms$,
    $subj$Order Delivered - Royal Perfume Hub$subj$,
    $body$<p>Thank you for shopping with Royal Perfume Hub. We hope to see you again soon!</p>$body$,
    true
  )
on conflict (trigger_id) do nothing;

-- -----------------------------------------------------------------------------
-- 11. Seed: Royal super admin (reuse the existing auth account)
-- -----------------------------------------------------------------------------
insert into public.profiles_royal_perfume_hub (id, email, role)
select u.id, u.email, 'super_admin'
from auth.users u
where u.email = 'gofrance01@gmail.com'
on conflict (id) do update set
  email = excluded.email,
  role = 'super_admin';

-- -----------------------------------------------------------------------------
-- 12. Clone the derme catalogue with new IDs
-- -----------------------------------------------------------------------------
drop table if exists royal_product_map;
create temp table royal_product_map on commit drop as
select p.id as old_id, gen_random_uuid() as new_id
from public.products_perfume_store p
where not exists (
  select 1 from public.products_royal_perfume_hub rp where rp.slug = p.slug
);

drop table if exists royal_inventory_map;
create temp table royal_inventory_map on commit drop as
select i.id as old_id, gen_random_uuid() as new_id
from public.inventory_master_perfume_store i
where not exists (
  select 1 from public.inventory_master_royal_perfume_hub ri
  where ri.product_name = i.product_name
);

insert into public.inventory_master_royal_perfume_hub
  (id, product_name, current_stock_level, low_stock_threshold)
select m.new_id, i.product_name, i.current_stock_level, i.low_stock_threshold
from public.inventory_master_perfume_store i
join royal_inventory_map m on m.old_id = i.id;

insert into public.products_royal_perfume_hub (
  id, title, slug, description, category, base_image_url, is_active, created_at,
  category_id, brand, is_featured, discount_percent, discount_start_at,
  discount_end_at, concentration, scent_family, scent_notes, longevity, sillage,
  gender, occasion, set_type, bundle_items
)
select
  m.new_id,
  p.title,
  p.slug,
  p.description,
  coalesce(rc.name, p.category),
  p.base_image_url,
  p.is_active,
  p.created_at,
  rc.id,
  p.brand,
  p.is_featured,
  p.discount_percent,
  p.discount_start_at,
  p.discount_end_at,
  p.concentration,
  p.scent_family,
  p.scent_notes,
  p.longevity,
  p.sillage,
  p.gender,
  p.occasion,
  p.set_type,
  coalesce(
    (
      select jsonb_agg(
        case
          when item ? 'product_id'
            and nullif(item->>'product_id', '') is not null
            and pm2.new_id is not null
          then jsonb_set(item, '{product_id}', to_jsonb(pm2.new_id))
          else item
        end
      )
      from jsonb_array_elements(coalesce(p.bundle_items, '[]'::jsonb)) as item
      left join royal_product_map pm2
        on pm2.old_id = nullif(item->>'product_id', '')::uuid
    ),
    '[]'::jsonb
  )
from public.products_perfume_store p
join royal_product_map m on m.old_id = p.id
left join public.categories_royal_perfume_hub rc
  on lower(rc.name) = lower(p.category);

insert into public.product_variants_royal_perfume_hub (
  id, product_id, name, type, price, sku, stock_deduction, master_stock_id, created_at
)
select
  gen_random_uuid(),
  pm.new_id,
  v.name,
  v.type,
  v.price,
  v.sku,
  v.stock_deduction,
  im.new_id,
  v.created_at
from public.product_variants_perfume_store v
join royal_product_map pm on pm.old_id = v.product_id
left join royal_inventory_map im on im.old_id = v.master_stock_id;

-- Use the full Royal concentration names on cloned products.
update public.products_royal_perfume_hub
set concentration = case concentration
  when 'EDP' then 'Eau de Parfum'
  when 'EDT' then 'Eau de Toilette'
  when 'Cologne' then 'Eau de Senteur'
  else concentration
end
where concentration in ('EDP', 'EDT', 'Cologne');

-- -----------------------------------------------------------------------------
-- 13. Ask PostgREST to reload its schema cache
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';

commit;

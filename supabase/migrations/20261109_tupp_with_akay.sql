-- =============================================================================
-- Tupp with akay tenant (multi-category PIM store)
-- =============================================================================
-- Suffix: _tupp_with_akay
-- Adds additive nullable columns to the existing stores so the admin PIM can
-- carry dynamic attributes, weights, dimensions and shipping classes without
-- breaking derme / play-time / Royal.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Tables (structure cloned from Royal)
-- -----------------------------------------------------------------------------
create table if not exists public.categories_tupp_with_akay
  (like public.categories_royal_perfume_hub including all);
create table if not exists public.delivery_zones_tupp_with_akay
  (like public.delivery_zones_royal_perfume_hub including all);
create table if not exists public.inventory_master_tupp_with_akay
  (like public.inventory_master_royal_perfume_hub including all);
create table if not exists public.marketing_campaigns_tupp_with_akay
  (like public.marketing_campaigns_royal_perfume_hub including all);
create table if not exists public.notification_templates_tupp_with_akay
  (like public.notification_templates_royal_perfume_hub including all);
create table if not exists public.order_items_tupp_with_akay
  (like public.order_items_royal_perfume_hub including all);
create table if not exists public.orders_tupp_with_akay
  (like public.orders_royal_perfume_hub including all);
create table if not exists public.payments_tupp_with_akay
  (like public.payments_royal_perfume_hub including all);
create table if not exists public.posts_tupp_with_akay
  (like public.posts_royal_perfume_hub including all);
create table if not exists public.product_reviews_tupp_with_akay
  (like public.product_reviews_royal_perfume_hub including all);
create table if not exists public.product_variants_tupp_with_akay
  (like public.product_variants_royal_perfume_hub including all);
create table if not exists public.products_tupp_with_akay
  (like public.products_royal_perfume_hub including all);
create table if not exists public.profiles_tupp_with_akay
  (like public.profiles_royal_perfume_hub including all);
create table if not exists public.sms_logs_tupp_with_akay
  (like public.sms_logs_royal_perfume_hub including all);
create table if not exists public.store_settings_tupp_with_akay
  (like public.store_settings_royal_perfume_hub including all);
create table if not exists public.taxes_tupp_with_akay
  (like public.taxes_royal_perfume_hub including all);

-- Order numbers use Tupp's own sequence.
create sequence if not exists public.orders_tupp_with_akay_order_number_seq;
alter sequence public.orders_tupp_with_akay_order_number_seq
  owned by public.orders_tupp_with_akay.order_number;
alter table public.orders_tupp_with_akay
  alter column order_number set default nextval('public.orders_tupp_with_akay_order_number_seq'::regclass);

-- Tupp-specific defaults.
alter table public.profiles_tupp_with_akay
  alter column role set default 'customer';
alter table public.store_settings_tupp_with_akay
  alter column support_email set default null;

-- -----------------------------------------------------------------------------
-- 2. Additive nullable columns (safe for all stores)
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
  stores text[] := array[
    'products_perfume_store','products_toy_shop','products_royal_perfume_hub','products_tupp_with_akay',
    'product_variants_perfume_store','product_variants_toy_shop','product_variants_royal_perfume_hub','product_variants_tupp_with_akay'
  ];
begin
  foreach t in array stores loop
    if t like 'products_%' then
      execute format('alter table public.%I add column if not exists attributes jsonb default ''{}''::jsonb', t);
      execute format('alter table public.%I add column if not exists category_class text', t);
      execute format('alter table public.%I add column if not exists weight_kg numeric', t);
      execute format('alter table public.%I add column if not exists dimensions text', t);
      execute format('alter table public.%I add column if not exists shipping_class text', t);
      execute format('alter table public.%I add column if not exists is_hazmat boolean', t);
      execute format('alter table public.%I add column if not exists is_fragile boolean', t);
      execute format('alter table public.%I add column if not exists has_lithium_battery boolean', t);
    else
      execute format('alter table public.%I add column if not exists variant_options jsonb default ''{}''::jsonb', t);
      execute format('alter table public.%I add column if not exists weight_kg numeric', t);
    end if;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 3. Foreign keys (LIKE does not copy them)
-- -----------------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('categories_tupp_with_akay', 'categories_tupp_with_akay_parent_id_fkey',
       'foreign key (parent_id) references public.categories_tupp_with_akay(id) on delete set null'),
      ('products_tupp_with_akay', 'products_tupp_with_akay_category_id_fkey',
       'foreign key (category_id) references public.categories_tupp_with_akay(id) on delete set null'),
      ('product_variants_tupp_with_akay', 'product_variants_tupp_with_akay_product_id_fkey',
       'foreign key (product_id) references public.products_tupp_with_akay(id) on delete cascade'),
      ('product_variants_tupp_with_akay', 'product_variants_tupp_with_akay_master_stock_id_fkey',
       'foreign key (master_stock_id) references public.inventory_master_tupp_with_akay(id)'),
      ('orders_tupp_with_akay', 'orders_tupp_with_akay_user_id_fkey',
       'foreign key (user_id) references auth.users(id) on delete set null'),
      ('orders_tupp_with_akay', 'orders_tupp_with_akay_delivery_zone_id_fkey',
       'foreign key (delivery_zone_id) references public.delivery_zones_tupp_with_akay(id) on delete set null'),
      ('order_items_tupp_with_akay', 'order_items_tupp_with_akay_order_id_fkey',
       'foreign key (order_id) references public.orders_tupp_with_akay(id) on delete cascade'),
      ('product_reviews_tupp_with_akay', 'product_reviews_tupp_with_akay_product_id_fkey',
       'foreign key (product_id) references public.products_tupp_with_akay(id) on delete cascade'),
      ('product_reviews_tupp_with_akay', 'product_reviews_tupp_with_akay_user_id_fkey',
       'foreign key (user_id) references auth.users(id) on delete cascade'),
      ('profiles_tupp_with_akay', 'profiles_tupp_with_akay_id_fkey',
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
-- 4. Functions
-- -----------------------------------------------------------------------------
create or replace function public.is_super_admin_tupp_with_akay()
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $fn$
begin
  return exists (
    select 1 from public.profiles_tupp_with_akay
    where id = auth.uid() and role = 'super_admin'
  );
end;
$fn$;

create or replace function public.enforce_tupp_store_slug()
returns trigger
language plpgsql
as $fn$
begin
  new.store_slug := 'tupp-with-akay';
  return new;
end;
$fn$;

drop trigger if exists enforce_tupp_store_slug_orders on public.orders_tupp_with_akay;
create trigger enforce_tupp_store_slug_orders
  before insert or update on public.orders_tupp_with_akay
  for each row execute function public.enforce_tupp_store_slug();

drop trigger if exists enforce_tupp_store_slug_payments on public.payments_tupp_with_akay;
create trigger enforce_tupp_store_slug_payments
  before insert or update on public.payments_tupp_with_akay
  for each row execute function public.enforce_tupp_store_slug();

-- Extend the shared auth router with the Tupp branch.
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

  if store_slug = 'tupp-with-akay' then
    insert into public.profiles_tupp_with_akay (id, email, role)
    values (new.id, new.email, 'customer')
    on conflict (id) do nothing;
  elsif store_slug = 'royal-perfume-hub' then
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

-- -----------------------------------------------------------------------------
-- 5. RLS
-- -----------------------------------------------------------------------------
alter table public.categories_tupp_with_akay enable row level security;
alter table public.delivery_zones_tupp_with_akay enable row level security;
alter table public.inventory_master_tupp_with_akay enable row level security;
alter table public.marketing_campaigns_tupp_with_akay enable row level security;
alter table public.notification_templates_tupp_with_akay enable row level security;
alter table public.order_items_tupp_with_akay enable row level security;
alter table public.orders_tupp_with_akay enable row level security;
alter table public.payments_tupp_with_akay enable row level security;
alter table public.posts_tupp_with_akay enable row level security;
alter table public.product_reviews_tupp_with_akay enable row level security;
alter table public.product_variants_tupp_with_akay enable row level security;
alter table public.products_tupp_with_akay enable row level security;
alter table public.profiles_tupp_with_akay enable row level security;
alter table public.sms_logs_tupp_with_akay enable row level security;
alter table public.store_settings_tupp_with_akay enable row level security;
alter table public.taxes_tupp_with_akay enable row level security;

-- Categories
drop policy if exists "Tupp public read categories" on public.categories_tupp_with_akay;
create policy "Tupp public read categories" on public.categories_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp admins manage categories" on public.categories_tupp_with_akay;
create policy "Tupp admins manage categories" on public.categories_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Delivery zones
drop policy if exists "Tupp public read zones" on public.delivery_zones_tupp_with_akay;
create policy "Tupp public read zones" on public.delivery_zones_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp admins manage zones" on public.delivery_zones_tupp_with_akay;
create policy "Tupp admins manage zones" on public.delivery_zones_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Taxes
drop policy if exists "Tupp public read taxes" on public.taxes_tupp_with_akay;
create policy "Tupp public read taxes" on public.taxes_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp admins manage taxes" on public.taxes_tupp_with_akay;
create policy "Tupp admins manage taxes" on public.taxes_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Store settings
drop policy if exists "Tupp public read settings" on public.store_settings_tupp_with_akay;
create policy "Tupp public read settings" on public.store_settings_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp admins manage settings" on public.store_settings_tupp_with_akay;
create policy "Tupp admins manage settings" on public.store_settings_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Notification templates
drop policy if exists "Tupp public read templates" on public.notification_templates_tupp_with_akay;
create policy "Tupp public read templates" on public.notification_templates_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp admins manage templates" on public.notification_templates_tupp_with_akay;
create policy "Tupp admins manage templates" on public.notification_templates_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Products
drop policy if exists "Tupp public read active products" on public.products_tupp_with_akay;
create policy "Tupp public read active products" on public.products_tupp_with_akay
  for select to public using (is_active = true);
drop policy if exists "Tupp admins manage products" on public.products_tupp_with_akay;
create policy "Tupp admins manage products" on public.products_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Product variants
drop policy if exists "Tupp public read variants" on public.product_variants_tupp_with_akay;
create policy "Tupp public read variants" on public.product_variants_tupp_with_akay
  for select to public using (
    exists (
      select 1 from public.products_tupp_with_akay p
      where p.id = product_id and p.is_active = true
    )
  );
drop policy if exists "Tupp admins manage variants" on public.product_variants_tupp_with_akay;
create policy "Tupp admins manage variants" on public.product_variants_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Inventory
drop policy if exists "Tupp public read inventory" on public.inventory_master_tupp_with_akay;
create policy "Tupp public read inventory" on public.inventory_master_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp admins manage inventory" on public.inventory_master_tupp_with_akay;
create policy "Tupp admins manage inventory" on public.inventory_master_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Blog posts
drop policy if exists "Tupp public read published posts" on public.posts_tupp_with_akay;
create policy "Tupp public read published posts" on public.posts_tupp_with_akay
  for select to public using (is_published = true);
drop policy if exists "Tupp admins manage posts" on public.posts_tupp_with_akay;
create policy "Tupp admins manage posts" on public.posts_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Campaigns
drop policy if exists "Tupp public read active campaigns" on public.marketing_campaigns_tupp_with_akay;
create policy "Tupp public read active campaigns" on public.marketing_campaigns_tupp_with_akay
  for select to public using (is_active = true);
drop policy if exists "Tupp admins manage campaigns" on public.marketing_campaigns_tupp_with_akay;
create policy "Tupp admins manage campaigns" on public.marketing_campaigns_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Reviews
drop policy if exists "Tupp public read reviews" on public.product_reviews_tupp_with_akay;
create policy "Tupp public read reviews" on public.product_reviews_tupp_with_akay
  for select to public using (true);
drop policy if exists "Tupp users create own reviews" on public.product_reviews_tupp_with_akay;
create policy "Tupp users create own reviews" on public.product_reviews_tupp_with_akay
  for insert to public with check (auth.uid() = user_id);
drop policy if exists "Tupp users update own reviews" on public.product_reviews_tupp_with_akay;
create policy "Tupp users update own reviews" on public.product_reviews_tupp_with_akay
  for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Tupp users delete own reviews" on public.product_reviews_tupp_with_akay;
create policy "Tupp users delete own reviews" on public.product_reviews_tupp_with_akay
  for delete to public using (auth.uid() = user_id);
drop policy if exists "Tupp admins manage reviews" on public.product_reviews_tupp_with_akay;
create policy "Tupp admins manage reviews" on public.product_reviews_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Profiles
drop policy if exists "Tupp users read own profile" on public.profiles_tupp_with_akay;
create policy "Tupp users read own profile" on public.profiles_tupp_with_akay
  for select to public using (auth.uid() = id);
drop policy if exists "Tupp admins manage profiles" on public.profiles_tupp_with_akay;
create policy "Tupp admins manage profiles" on public.profiles_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Orders
drop policy if exists "Tupp anyone create orders" on public.orders_tupp_with_akay;
create policy "Tupp anyone create orders" on public.orders_tupp_with_akay
  for insert to public with check (true);
drop policy if exists "Tupp users read own orders" on public.orders_tupp_with_akay;
create policy "Tupp users read own orders" on public.orders_tupp_with_akay
  for select to public using (auth.uid() = user_id);
drop policy if exists "Tupp admins manage orders" on public.orders_tupp_with_akay;
create policy "Tupp admins manage orders" on public.orders_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Order items
drop policy if exists "Tupp anyone create order items" on public.order_items_tupp_with_akay;
create policy "Tupp anyone create order items" on public.order_items_tupp_with_akay
  for insert to public with check (true);
drop policy if exists "Tupp users read own order items" on public.order_items_tupp_with_akay;
create policy "Tupp users read own order items" on public.order_items_tupp_with_akay
  for select to public using (
    exists (
      select 1 from public.orders_tupp_with_akay o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
drop policy if exists "Tupp admins manage order items" on public.order_items_tupp_with_akay;
create policy "Tupp admins manage order items" on public.order_items_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- Payments
drop policy if exists "Tupp admins manage payments" on public.payments_tupp_with_akay;
create policy "Tupp admins manage payments" on public.payments_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- SMS logs
drop policy if exists "Tupp admins read sms logs" on public.sms_logs_tupp_with_akay;
create policy "Tupp admins read sms logs" on public.sms_logs_tupp_with_akay
  for select to public using (public.is_super_admin_tupp_with_akay());
drop policy if exists "Tupp admins manage sms logs" on public.sms_logs_tupp_with_akay;
create policy "Tupp admins manage sms logs" on public.sms_logs_tupp_with_akay
  for all to public using (public.is_super_admin_tupp_with_akay())
  with check (public.is_super_admin_tupp_with_akay());

-- -----------------------------------------------------------------------------
-- 6. Grants
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on table
  public.categories_tupp_with_akay,
  public.delivery_zones_tupp_with_akay,
  public.inventory_master_tupp_with_akay,
  public.marketing_campaigns_tupp_with_akay,
  public.notification_templates_tupp_with_akay,
  public.posts_tupp_with_akay,
  public.product_reviews_tupp_with_akay,
  public.product_variants_tupp_with_akay,
  public.products_tupp_with_akay,
  public.store_settings_tupp_with_akay,
  public.taxes_tupp_with_akay
to anon, authenticated;

grant insert on table
  public.orders_tupp_with_akay,
  public.order_items_tupp_with_akay
to anon, authenticated;

grant select, insert, update, delete on table
  public.orders_tupp_with_akay,
  public.order_items_tupp_with_akay,
  public.profiles_tupp_with_akay,
  public.payments_tupp_with_akay,
  public.sms_logs_tupp_with_akay
to authenticated;

grant insert, update, delete on table
  public.categories_tupp_with_akay,
  public.delivery_zones_tupp_with_akay,
  public.inventory_master_tupp_with_akay,
  public.marketing_campaigns_tupp_with_akay,
  public.notification_templates_tupp_with_akay,
  public.posts_tupp_with_akay,
  public.product_reviews_tupp_with_akay,
  public.product_variants_tupp_with_akay,
  public.products_tupp_with_akay,
  public.store_settings_tupp_with_akay,
  public.taxes_tupp_with_akay
to authenticated;

grant usage, select on sequence public.orders_tupp_with_akay_order_number_seq
  to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 7. Storage
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images-tupp-with-akay', 'product-images-tupp-with-akay', true, 52428800, array['image/*']),
  ('blog-images-tupp-with-akay', 'blog-images-tupp-with-akay', true, 52428800, array['image/*']),
  ('marketing-assets-tupp-with-akay', 'marketing-assets-tupp-with-akay', true, 52428800, array['image/*'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- 8. Seed: settings
-- -----------------------------------------------------------------------------
insert into public.store_settings_tupp_with_akay (
  id, whatsapp_phone, support_email, enable_outside_accra, enable_international,
  bulk_threshold, bulk_surcharge, master_sms_enabled, master_email_enabled,
  enable_admin_alerts, enable_customer_alerts, backup_admin_phone,
  enable_backup_phone, admin_alert_email, primary_phone
) values (
  1, '233240000000', null, false, false,
  10, 5, true, true,
  true, true, null,
  false, null, '+233 24 000 0000'
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
-- 9. Seed: categories (deep taxonomy)
-- -----------------------------------------------------------------------------
insert into public.categories_tupp_with_akay (name, slug, parent_id)
select v.name, v.slug, null
from (values
  ('Electronics', 'electronics'),
  ('Home & Living', 'home-living'),
  ('Beauty & Fragrance', 'beauty-fragrance'),
  ('New Arrivals', 'new-arrivals'),
  ('Deals', 'deals')
) as v(name, slug)
where not exists (
  select 1 from public.categories_tupp_with_akay c where c.slug = v.slug
);

-- -----------------------------------------------------------------------------
-- 10. Seed: delivery zones and taxes
-- -----------------------------------------------------------------------------
insert into public.delivery_zones_tupp_with_akay (name, region_category, base_price, is_active)
select v.name, v.region_category, v.base_price, true
from (values
  ('Accra Central', 'accra_subzone', 15::numeric),
  ('East Legon / Adjiringanor', 'accra_subzone', 25::numeric),
  ('Osu / Cantonments', 'accra_subzone', 15::numeric),
  ('Airport Residential', 'accra_subzone', 20::numeric),
  ('Spintex / Sakumono', 'accra_subzone', 30::numeric),
  ('Tema', 'accra_subzone', 40::numeric),
  ('Ashanti Region', 'regional', 100::numeric),
  ('Western Region', 'regional', 120::numeric)
) as v(name, region_category, base_price)
where not exists (
  select 1 from public.delivery_zones_tupp_with_akay z where z.name = v.name
);

insert into public.taxes_tupp_with_akay (name, rate_percent, is_active, priority)
select v.name, v.rate_percent, v.is_active, v.priority
from (values
  ('NHIL', 2.5::numeric, true, 1),
  ('GetFund', 2.5::numeric, true, 2),
  ('COVID-19 Levy', 1::numeric, false, 3),
  ('VAT', 15::numeric, true, 4)
) as v(name, rate_percent, is_active, priority)
where not exists (
  select 1 from public.taxes_tupp_with_akay t where t.name = v.name
);

-- -----------------------------------------------------------------------------
-- 11. Seed: notification templates (generic, no order number in customer copy)
-- -----------------------------------------------------------------------------
insert into public.notification_templates_tupp_with_akay
  (trigger_id, name, sms_template, email_subject, email_body, is_active)
values
  (
    'new_order_admin',
    'Admin: New Order Received',
    $sms$New Tupp with akay order! Amount: {{total}}. Customer: {{customer_name}}.$sms$,
    $subj$New Tupp with akay Order$subj$,
    $body$You have received a new order from {{customer_name}}. Total: {{total}}. Check the Tupp with akay dashboard for details.$body$,
    true
  ),
  (
    'new_order_customer',
    'Customer: Order Confirmation',
    $sms$Hi {{customer_name}}, thanks for your order at Tupp with akay! Total: {{total}}. We will contact you shortly.$sms$,
    $subj$Tupp with akay Order Confirmation$subj$,
    $body$<h3>Thank you for your order!</h3><p>We have received your order at Tupp with akay.</p>{{invoice_table}}$body$,
    true
  ),
  (
    'payment_received',
    'Customer: Payment Received',
    $sms$Payment received for your Tupp with akay order. We are processing it now.$sms$,
    $subj$Payment Confirmed - Tupp with akay$subj$,
    $body$<p>We have received your payment of {{total}}. Your order is now being processed.</p>$body$,
    true
  ),
  (
    'status_dispatched',
    'Customer: Order Dispatched',
    $sms$Good news! Your Tupp with akay order has been dispatched. Expect delivery soon.$sms$,
    $subj$Your Tupp with akay Order is on the way$subj$,
    $body$<p>Your order has been dispatched and is making its way to you.</p>$body$,
    true
  ),
  (
    'status_delivered',
    'Customer: Order Delivered',
    $sms$Order delivered. Enjoy your purchase! - Tupp with akay$sms$,
    $subj$Order Delivered - Tupp with akay$subj$,
    $body$<p>Thank you for shopping with Tupp with akay. We hope to see you again soon!</p>$body$,
    true
  )
on conflict (trigger_id) do nothing;

-- -----------------------------------------------------------------------------
-- 12. Seed: Royal super admin (reuse the existing auth account)
-- -----------------------------------------------------------------------------
insert into public.profiles_tupp_with_akay (id, email, role)
select u.id, u.email, 'super_admin'
from auth.users u
where u.email = 'gofrance01@gmail.com'
on conflict (id) do update set
  email = excluded.email,
  role = 'super_admin';

-- -----------------------------------------------------------------------------
-- 13. Clone the Royal catalogue with new IDs (ready to sell)
-- -----------------------------------------------------------------------------
drop table if exists tupp_product_map;
create temp table tupp_product_map on commit drop as
select p.id as old_id, gen_random_uuid() as new_id
from public.products_royal_perfume_hub p
where not exists (
  select 1 from public.products_tupp_with_akay tp where tp.slug = p.slug
);

drop table if exists tupp_inventory_map;
create temp table tupp_inventory_map on commit drop as
select i.id as old_id, gen_random_uuid() as new_id
from public.inventory_master_royal_perfume_hub i
where not exists (
  select 1 from public.inventory_master_tupp_with_akay ti where ti.product_name = i.product_name
);

insert into public.inventory_master_tupp_with_akay
  (id, product_name, current_stock_level, low_stock_threshold)
select m.new_id, i.product_name, i.current_stock_level, i.low_stock_threshold
from public.inventory_master_royal_perfume_hub i
join tupp_inventory_map m on m.old_id = i.id;

insert into public.products_tupp_with_akay (
  id, title, slug, description, category, base_image_url, is_active, created_at,
  category_id, brand, is_featured, discount_percent, discount_start_at,
  discount_end_at, concentration, scent_family, scent_notes, longevity, sillage,
  gender, occasion, set_type, bundle_items, attributes, category_class
)
select
  m.new_id,
  p.title,
  p.slug,
  p.description,
  'Beauty & Fragrance',
  p.base_image_url,
  p.is_active,
  p.created_at,
  (select id from public.categories_tupp_with_akay where slug = 'beauty-fragrance'),
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
  coalesce(p.bundle_items, '[]'::jsonb),
  coalesce(p.attributes, '{}'::jsonb),
  'Beauty & Fragrance'
from public.products_royal_perfume_hub p
join tupp_product_map m on m.old_id = p.id;

insert into public.product_variants_tupp_with_akay (
  id, product_id, name, type, price, sku, stock_deduction, master_stock_id, created_at, variant_options
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
  v.created_at,
  coalesce(v.variant_options, '{}'::jsonb)
from public.product_variants_royal_perfume_hub v
join tupp_product_map pm on pm.old_id = v.product_id
left join tupp_inventory_map im on im.old_id = v.master_stock_id;

-- -----------------------------------------------------------------------------
-- 14. PostgREST schema cache reload
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';

commit;

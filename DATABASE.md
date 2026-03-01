# Perfume Store Accra — Supabase Database Documentation

This document describes the complete database structure for the Perfume Store Accra project hosted on Supabase. Use this as a reference when writing queries, building features, or working with the AI on this codebase.

---

## Project Info

- **Platform:** Supabase (PostgreSQL)
- **Project Name:** perfume-store-accra
- **URL:** <https://eominikzaajxzvmmpmtt.supabase.co>
- **Schema:** `public` (all custom tables live here)

---

## Extensions

```sql
uuid-ossp  -- Used for uuid_generate_v4() as default primary keys
```

---

## Custom Functions

### `is_super_admin()`

Returns `true` if the currently authenticated user has `role = 'super_admin'` in the profiles table. Used extensively in RLS policies.

```sql
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
end;
$$;
```

### `handle_new_user()`

Automatically creates a profile row in `public.profiles` whenever a new user signs up via Supabase Auth. Triggered by `on_auth_user_created`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$;
```

---

## Auth Trigger

```sql
-- Fires after every new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## User Roles

Roles are stored as plain text in `public.profiles.role`. There are 3 roles:

| Role | Description |
|---|---|
| `customer` | Default role assigned on signup. Can shop, review, view orders. |
| `store_manager` | Can manage products, inventory, orders. |
| `super_admin` | Full access. Can manage users, settings, all admin features. |

---

## Tables

### 1. `categories`

Stores product categories. Supports self-referencing parent/child hierarchy.

```sql
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  slug        text NOT NULL,
  parent_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url   text,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public can view categories | SELECT | `true` |
| Admins can manage categories | ALL | `is_super_admin()` |

---

### 2. `profiles`

Stores user profile data. Linked 1:1 with `auth.users`. Auto-created via trigger on signup.

```sql
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  role        text NOT NULL DEFAULT 'store_manager',
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**Notes:**

- `id` matches `auth.users.id` exactly
- Default role on signup is `customer` (set by `handle_new_user()` trigger)
- To promote a user to super_admin: `UPDATE public.profiles SET role = 'super_admin' WHERE email = 'admin@example.com';`

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Users can read own profile | SELECT | `auth.uid() = id` |
| Admins can read all profiles | SELECT | `is_super_admin()` |

---

### 3. `products`

Core product catalog.

```sql
CREATE TABLE public.products (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             text NOT NULL,
  slug              text NOT NULL,
  description       text,
  category          text NOT NULL,
  base_image_url    text NOT NULL,
  is_active         boolean DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
  category_id       uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand             text,
  is_featured       boolean DEFAULT false,
  discount_percent  integer DEFAULT 0,
  discount_start_at timestamptz,
  discount_end_at   timestamptz,
  concentration     text,
  scent_family      text,
  scent_notes       jsonb,
  longevity         text,
  sillage           text,
  gender            text,
  occasion          text[]
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public products are viewable | SELECT | `true` |
| Public full access during dev | ALL | `true` |
| Admins can insert products | INSERT | `auth.role() = 'authenticated'` |
| Admins can update products | UPDATE | `auth.role() = 'authenticated'` |
| Admins can delete products | DELETE | `auth.role() = 'authenticated'` |

---

### 4. `product_variants`

Each product can have multiple variants (e.g. size, volume). Price is set per variant.

```sql
CREATE TABLE public.product_variants (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name             text NOT NULL,
  type             text NOT NULL,
  price            numeric NOT NULL,
  sku              text,
  stock_deduction  integer NOT NULL DEFAULT 1,
  master_stock_id  uuid,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public variants are viewable | SELECT | `true` |
| Public can view variants | SELECT | `true` |
| Admins can insert variants | INSERT | `auth.role() = 'authenticated'` |
| Admins can update variants | UPDATE | `auth.role() = 'authenticated'` |
| Admins can delete variants | DELETE | `auth.role() = 'authenticated'` |

---

### 5. `delivery_zones`

Defines delivery areas and their base prices.

```sql
CREATE TABLE public.delivery_zones (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             text NOT NULL,
  region_category  text NOT NULL,
  base_price       numeric NOT NULL,
  is_active        boolean DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public read zones | SELECT | `true` |
| Admins manage zones | ALL | `is_super_admin()` |

---

### 6. `taxes`

Tax rates applied to orders.

```sql
CREATE TABLE public.taxes (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  rate_percent numeric NOT NULL,
  is_active    boolean DEFAULT true,
  priority     integer DEFAULT 1
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public read taxes | SELECT | `true` |
| Admins manage taxes | ALL | `is_super_admin()` |

---

### 7. `orders`

Customer orders. Uses a sequential `order_number` for human-readable order IDs.

```sql
CREATE SEQUENCE orders_order_number_seq;

CREATE TABLE public.orders (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     integer NOT NULL DEFAULT nextval('orders_order_number_seq'),
  user_phone       text NOT NULL,
  user_email       text,
  total_amount     numeric NOT NULL,
  delivery_fee     numeric DEFAULT 0,
  payment_method   text NOT NULL,
  payment_status   text DEFAULT 'pending',
  delivery_status  text DEFAULT 'processing',
  delivery_address text NOT NULL,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
  user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tax_amount       numeric DEFAULT 0,
  discount_amount  numeric DEFAULT 0,
  delivery_zone_id uuid REFERENCES public.delivery_zones(id) ON DELETE SET NULL
);
```

**Payment status values:** `pending`, `paid`, `failed`
**Delivery status values:** `processing`, `shipped`, `delivered`, `cancelled`

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Enable insert for all users | INSERT | `true` |
| Enable read for all users | SELECT | `true` |

---

### 8. `order_items`

Line items belonging to an order. Stores snapshot of product/price at time of purchase.

```sql
CREATE TABLE public.order_items (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_title      text NOT NULL,
  variant_name       text NOT NULL,
  price_at_purchase  numeric NOT NULL,
  quantity           integer NOT NULL,
  subtotal           numeric NOT NULL
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Enable insert for all users | INSERT | `true` |
| Enable read for all users | SELECT | `true` |

---

### 9. `inventory_master`

Tracks stock levels for products.

```sql
CREATE TABLE public.inventory_master (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name         text NOT NULL,
  current_stock_level  integer NOT NULL DEFAULT 0,
  low_stock_threshold  integer DEFAULT 10
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public full access during dev | ALL | `true` |
| Admins can insert inventory | INSERT | `auth.role() = 'authenticated'` |
| Admins can update inventory | UPDATE | `auth.role() = 'authenticated'` |
| Admins can delete inventory | DELETE | `auth.role() = 'authenticated'` |
| Public can view inventory | SELECT | `true` |

---

### 10. `store_settings`

Single-row table for global store configuration. Always has `id = 1`.

```sql
CREATE TABLE public.store_settings (
  id                      integer PRIMARY KEY DEFAULT 1,
  whatsapp_phone          text DEFAULT '233240000000',
  support_email           text DEFAULT 'admin@liquorshop.gh',
  enable_outside_accra    boolean DEFAULT false,
  enable_international    boolean DEFAULT false,
  bulk_threshold          integer DEFAULT 10,
  bulk_surcharge          numeric DEFAULT 5.00,
  master_sms_enabled      boolean DEFAULT true,
  master_email_enabled    boolean DEFAULT true,
  enable_admin_alerts     boolean DEFAULT true,
  enable_customer_alerts  boolean DEFAULT true,
  backup_admin_phone      text,
  enable_backup_phone     boolean DEFAULT false,
  admin_alert_email       text,
  primary_phone           text DEFAULT '233240000000',
  CONSTRAINT store_settings_single_row CHECK (id = 1)
);
```

**Notes:**

- Always query with `SELECT * FROM store_settings WHERE id = 1`
- Always update with `UPDATE store_settings SET ... WHERE id = 1`
- Never insert a second row — the CHECK constraint prevents it

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public read settings | SELECT | `true` |
| Admins update settings | UPDATE | `is_super_admin()` |

---

### 11. `posts`

Blog posts. Supports draft/published state and SEO metadata.

```sql
CREATE TABLE public.posts (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  slug             text NOT NULL UNIQUE,
  excerpt          text,
  content          text,
  cover_image_url  text,
  seo_title        text,
  seo_description  text,
  is_published     boolean DEFAULT false,
  published_at     timestamptz DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at       timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public can read published posts | SELECT | `is_published = true` |
| Admins manage posts | ALL | `auth.role() = 'authenticated'` |

---

### 12. `product_reviews`

Customer reviews for products. Rating must be between 1 and 5.

```sql
CREATE TABLE public.product_reviews (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Users can create reviews | INSERT | `auth.uid() = user_id` |
| Users can delete own reviews | DELETE | `auth.uid() = user_id` |
| Admins can delete reviews | DELETE | `is_super_admin()` |
| Public can read reviews | SELECT | `true` |

---

### 13. `marketing_campaigns`

Promotional banners and campaigns displayed on the storefront.

```sql
CREATE TABLE public.marketing_campaigns (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text NOT NULL,
  description text,
  media_type  text NOT NULL,
  media_url   text NOT NULL,
  cta_text    text,
  cta_link    text,
  start_at    timestamptz,
  end_at      timestamptz,
  is_active   boolean DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public view active campaigns | SELECT | `true` |
| Admins manage campaigns | ALL | `is_super_admin()` |

---

### 14. `notification_templates`

SMS and email templates for automated notifications. Keyed by `trigger_id`.

```sql
CREATE TABLE public.notification_templates (
  trigger_id     text PRIMARY KEY,
  name           text NOT NULL,
  sms_template   text,
  email_subject  text,
  email_body     text,
  is_active      boolean DEFAULT true
);
```

**Notes:**

- `trigger_id` is a human-readable key like `order_placed`, `order_shipped`, etc.
- Templates support placeholder variables like `{{order_number}}`, `{{customer_name}}`

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Public read templates | SELECT | `true` |
| Admins manage templates | ALL | `is_super_admin()` |

---

### 15. `sms_logs`

Audit log of all SMS messages sent by the system.

```sql
CREATE TABLE public.sms_logs (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone          text NOT NULL,
  message        text NOT NULL,
  status         text DEFAULT 'pending',
  response_data  jsonb,
  created_at     timestamptz NOT NULL DEFAULT timezone('utc', now())
);
```

**Status values:** `pending`, `sent`, `failed`

**RLS Policies:**

| Policy | Command | Rule |
|---|---|---|
| Admins can view sms logs | SELECT | `is_super_admin()` |
| No public inserts | INSERT | `false` (blocked) |

---

## Storage Buckets

All buckets are **PUBLIC** with a **50MB** file size limit and allow **`image/*`** MIME types only.

### `product-images`

Stores product and variant images.

| Policy | Command | Rule |
|---|---|---|
| Public Access | SELECT | public |
| Admin Upload | INSERT | `auth.role() = 'authenticated'` |
| Admin Update | UPDATE | `auth.role() = 'authenticated'` |
| Admin Delete | DELETE | `auth.role() = 'authenticated'` |

### `blog-images`

Stores cover images for blog posts.

| Policy | Command | Rule |
|---|---|---|
| Public Access Blog | SELECT | public |
| Admin Upload Blog | INSERT | `auth.role() = 'authenticated'` |
| Admin Delete Blog | DELETE | `auth.role() = 'authenticated'` |

### `marketing-assets`

Stores images for marketing campaigns and banners.

| Policy | Command | Rule |
|---|---|---|
| Public Access Marketing | SELECT | public |
| Admin Upload Marketing | INSERT | `auth.role() = 'authenticated'` |
| Admin Delete Marketing | DELETE | `auth.role() = 'authenticated'` |

---

## Table Relationships Overview

```
auth.users
  ├── profiles (1:1, via trigger)
  ├── orders (1:many, user_id)
  └── product_reviews (1:many, user_id)

categories
  ├── categories (self-ref, parent_id)
  └── products (1:many, category_id)

products
  ├── product_variants (1:many, product_id)
  └── product_reviews (1:many, product_id)

orders
  ├── order_items (1:many, order_id)
  └── delivery_zones (many:1, delivery_zone_id)
```

---

## Common Query Patterns

```sql
-- Get all active products with their category
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Get all variants for a product
SELECT * FROM product_variants
WHERE product_id = 'your-product-uuid';

-- Get an order with its items
SELECT o.*, oi.*
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = 'your-order-uuid';

-- Get store settings (always id = 1)
SELECT * FROM store_settings WHERE id = 1;

-- Get active delivery zones
SELECT * FROM delivery_zones WHERE is_active = true;

-- Get active taxes ordered by priority
SELECT * FROM taxes WHERE is_active = true ORDER BY priority ASC;

-- Get published blog posts
SELECT * FROM posts WHERE is_published = true ORDER BY published_at DESC;

-- Check if current user is super_admin
SELECT is_super_admin();

-- Promote a user to super_admin
UPDATE profiles SET role = 'super_admin' WHERE email = 'admin@example.com';
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://eominikzaajxzvmmpmtt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code (API routes, server actions). Never expose it on the client.

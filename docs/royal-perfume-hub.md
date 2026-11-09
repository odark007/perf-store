# Royal Perfume Hub — Tenant & Deployment

Royal Perfume Hub is a third store on the shared Supabase project.

| Property | Value |
|---|---|
| Slug | `royal-perfume-hub` |
| Brand | Royal Perfume Hub |
| Slogan | Unveil Your Charm |
| Dominant colour | Royal Plum / Deep Purple `#553553` |
| Table suffix | `_royal_perfume_hub` |
| Storage bucket | `product-images-royal-perfume-hub` |
| Public phone | 0593448658 / 0537681940 |
| Location | Haatso-Bohye, Near Academic City University, Accra |
| Socials | Instagram / Facebook / TikTok — Royal Perfume Hub |

> **Status:** the application tenant **and** the database tenant are provisioned
> (2026-11-04). The migration is `supabase/migrations/20261104_royal_perfume_hub.sql`.
> Royal has its own tables, RLS, buckets, settings, categories, delivery zones,
> taxes, notification templates, and a cloned catalogue (11 products / 13 variants).
>
> The seven perfume types are seeded as categories **and** added to the admin
> concentration options: Extrait de Parfum, Parfum, Eau de Parfum, Eau de Toilette,
> Eau Fraiche, Eau de Senteur, Splash.

---

## 1. Why a separate suffix

Strict multitenancy means each shop owns its own table set. Royal must never read
or write `_perfume_store` (derme) or `_toy_shop` (play-time) rows.

| Store | Suffix |
|---|---|
| derme | `_perfume_store` |
| play-time | `_toy_shop` |
| royal-perfume-hub | `_royal_perfume_hub` |

`lib/stores/config.ts` is the single source of truth. `getStore()` now throws for
unknown slugs instead of silently falling back to derme.

---

## 2. Netlify site B (Royal)

Create a **second Netlify site** from the same repository. The two sites deploy
the same code but use different environment variables.

### Required environment variables

| Variable | Value |
|---|---|
| `STORE_SLUG` | `royal-perfume-hub` |
| `NEXT_PUBLIC_STORE_SLUG` | `royal-perfume-hub` |
| `NEXT_PUBLIC_SUPABASE_URL` | shared Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | shared anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | shared service-role key (server only) |
| `NEXT_PUBLIC_SITE_URL` | `https://<royal-domain>` |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key |
| `PAYSTACK_CALLBACK_BASE_URL` | `https://<royal-domain>` |
| `ARKESEL_API_KEY` | Arkesel key |
| `ARKESEL_SENDER_ID` | approved sender ID |
| `EMAILJS_SERVICE_ID` | EmailJS service |
| `EMAILJS_TEMPLATE_ID` | EmailJS template |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `EMAILJS_PRIVATE_KEY` | EmailJS private key |
| `NEXT_PUBLIC_GA_ID` | Royal GA4 property (separate from derme) |

`STORE_SLUG` locks the deployment:

- `/` → rewrites to `/royal-perfume-hub`
- `/shop`, `/products/...`, `/checkout` → rewritten under the Royal tenant
- `/admin` → rewrites to `/admin/royal-perfume-hub/dashboard`
- `/admin/<other-store>/...` → redirected back to the Royal dashboard
- the admin store switcher is hidden; `/admin` never lists other tenants
- any other known store prefix (e.g. `/derme/...`) → redirected to the root

`NEXT_PUBLIC_STORE_SLUG` lets client components resolve the tenant without the
path prefix.

### Domain / DNS

1. Add the custom domain in Netlify and point DNS as instructed.
2. Add the domain to Supabase **Authentication → URL Configuration → Redirect URLs**:
   - `https://<royal-domain>/auth/update-password`
   - `https://<royal-domain>/**`
3. Set the Paystack callback URL:
   - `https://<royal-domain>/checkout/verify`
4. Register the Paystack webhook once for the project:
   - `https://<royal-domain>/api/paystack/webhook`
   - Paystack sends `metadata.store_slug`; the webhook resolves the right tables.

Royal uses the **same Paystack account** as derme (confirmed). One webhook is
enough because every transaction carries `metadata.store_slug`. The callback
URL is tenant-specific only because the customer is returned to the storefront
they paid from.

### Do not

- Do not set `STORE_SLUG` on the main site.
- Do not share the Royal `NEXT_PUBLIC_GA_ID` with derme.
- Do not point Royal's env at derme's `_perfume_store` tables.

---

## 3. Database tenant (applied)

`supabase/migrations/20261104_royal_perfume_hub.sql` created:

1. 16 `_royal_perfume_hub` tables with FKs, indexes and the
   `orders_royal_perfume_hub_order_number_seq` sequence.
2. `is_super_admin_royal_perfume_hub()` and `handle_new_user_jarayel()` — a
   tenant-aware auth trigger that reads `raw_user_meta_data.store_slug` and
   creates a profile only in that store.
3. RLS with hardened policies:
   - orders: own-order or Royal admin; anon can create guest orders
   - order items: own-order or Royal admin
   - payments: Royal admin / service role only
   - catalog writes: Royal super-admin only
   - `store_slug` is forced to `royal-perfume-hub` by triggers on orders/payments
4. Buckets `product-images-royal-perfume-hub`,
   `blog-images-royal-perfume-hub`, `marketing-assets-royal-perfume-hub`.
5. Settings, 12 categories (7 perfume types + 5 shop departments), 8 delivery
   zones, 4 taxes, 5 notification templates, and the cloned catalogue.
   Game Day has been removed; Gift Sets is the only bundle type.
6. `gofrance01@gmail.com` added as Royal `super_admin`.

Verified with anon and Royal-admin role simulations:
- anon reads Royal products/categories/settings, not orders/profiles/payments
- anon cannot update Royal inventory
- anon can create a guest order; the trigger rewrites a spoofed `derme` slug to
  `royal-perfume-hub`
- Royal admin can update products and read orders

Note: derme still has its older permissive policies and was not hardened by this
migration. That remains a separate approved task.

---

## 4. Brand metadata

All of it is centralised in `lib/stores/config.ts`:

- name, slogan, monogram, business type
- phones, WhatsApp, address, map query
- Instagram / Facebook / TikTok
- hero copy, SEO title/description/keywords
- theme palette (`#553553` deep plum + champagne accent)

Edit the registry rather than hard-coding strings in components.

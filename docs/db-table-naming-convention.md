# Supabase Resource Naming Convention

## The rule

Every named Supabase resource is namespaced by **store**. The suffix is the
store's `tableSuffix` from `lib/stores/config.ts`.

| Store | Slug | Suffix |
|---|---|---|
| The Perfume Store Ghana | `derme` | `_perfume_store` |
| Tomorrow's Playground | `play-time` | `_toy_shop` |
| Royal Perfume Hub | `royal-perfume-hub` | `_royal_perfume_hub` |

This applies to:

### Database tables

Examples:

- `products_perfume_store`
- `products_toy_shop`
- `products_royal_perfume_hub`
- `sms_logs_perfume_store`
- `orders_toy_shop`

### Storage buckets

Examples:

- `product-images-perfume-store`
- `product-images-toy-shop`
- `product-images-royal-perfume-hub`

### Edge functions

Examples:

- `send-welcome-email_perfume_store`
- `generate-report_toy_shop`
- `process-payment_webhook_royal_perfume_hub`

## Isolation rules

1. A request for one store must never `SELECT`, `INSERT`, `UPDATE`, `DELETE`,
   join with, or otherwise access another store's suffix.
2. The suffix is derived from `getTables(storeSlug)`. Do not build table names by
   string concatenation in feature code.
3. `getStore()` throws for unknown slugs. There is no silent fallback to derme.
4. Tenant resolution is server-side: the `jarayel_store` cookie (multi-store
   deployment) or the `STORE_SLUG` environment variable (locked deployment).
5. Auth is shared at the `auth.users` level, but profiles and roles are per store.
   Every store-scoped write must verify that the acting user has a role in that
   store.

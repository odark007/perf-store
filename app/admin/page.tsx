import { redirect } from 'next/navigation';
import { getCurrentStoreSlugOrNull } from '@/lib/stores/context';

export const dynamic = 'force-dynamic';

/**
 * Admin is strictly store-scoped. There is deliberately no store chooser:
 * a console must never reveal that other tenants exist.
 *
 * Resolution order:
 *   1. Locked deployment (STORE_SLUG / NEXT_PUBLIC_STORE_SLUG) → that store.
 *   2. Store cookie set by visiting /<store> → that store.
 *   3. No context → back to the entry point, never a guessed tenant.
 */
export default async function AdminHomePage() {
  const storeSlug = await getCurrentStoreSlugOrNull();

  if (!storeSlug) {
    redirect('/');
  }

  redirect(`/admin/${storeSlug}/dashboard`);
}

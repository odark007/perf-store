import { cookies } from 'next/headers';
import {
  getLockedStoreSlug,
  getStore,
  getTables,
  resolveStoreSlug,
  STORES,
  STORE_COOKIE,
} from './config';
import type { StoreConfig } from './config';

/** Current tenant, or null when there is genuinely no store context. */
export async function getCurrentStoreSlugOrNull(): Promise<string | null> {
  const locked = getLockedStoreSlug();
  if (locked) return locked;

  const cookieStore = await cookies();
  return resolveStoreSlug(cookieStore.get(STORE_COOKIE)?.value);
}

/**
 * Current tenant. Throws instead of silently defaulting to derme, so a request
 * without a store can never read another tenant's data.
 */
export async function getCurrentStoreSlug(): Promise<string> {
  const slug = await getCurrentStoreSlugOrNull();
  if (!slug) {
    throw new Error(
      'No active store context. Visit a /<store> route or set STORE_SLUG for a locked deployment.'
    );
  }
  return slug;
}

export async function getCurrentStore(): Promise<StoreConfig> {
  return getStore(await getCurrentStoreSlug());
}

export async function getCurrentTables() {
  return getTables(await getCurrentStoreSlug());
}

export { getLockedStoreSlug, getStore, getTables, STORES, resolveStoreSlug };
export type { StoreConfig };

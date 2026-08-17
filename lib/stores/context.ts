import { cookies } from 'next/headers';
import { getStoreOrNull, getStore, getTables, STORES, STORE_COOKIE } from './config';
import type { StoreConfig } from './config';

// Read the current store slug from the cookie set by the store layout/middleware.
export async function getCurrentStoreSlug(): Promise<string> {
  const cookieStore = await cookies();
  const slug = cookieStore.get(STORE_COOKIE)?.value;
  return slug && getStoreOrNull(slug) ? slug : 'derme';
}

export async function getCurrentStore(): Promise<StoreConfig> {
  return getStore(await getCurrentStoreSlug());
}

export async function getCurrentTables() {
  return getTables(await getCurrentStoreSlug());
}

export { getStoreOrNull, getStore, getTables, STORES };
export type { StoreConfig };
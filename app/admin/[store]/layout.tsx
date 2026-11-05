import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getLockedStoreSlug, getStoreOrNull, getStoreThemeVars } from '@/lib/stores/config';

interface AdminStoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}

/**
 * Applies the tenant palette to admin pages and rejects unknown store slugs.
 * The sidebar lives in the parent layout, so it keeps the platform palette.
 */
export default async function AdminStoreLayout({ children, params }: AdminStoreLayoutProps) {
  const { store: storeSlug } = await params;

  // A locked deployment may only manage its own tenant.
  const lockedSlug = getLockedStoreSlug();
  if (lockedSlug && storeSlug !== lockedSlug) {
    redirect(`/admin/${lockedSlug}/dashboard`);
  }

  const store = getStoreOrNull(storeSlug);
  if (!store) notFound();

  return (
    <div style={getStoreThemeVars(store.theme) as React.CSSProperties} data-admin-store={store.slug}>
      {children}
    </div>
  );
}

import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getLockedStoreSlug, getStoreOrNull, getStoreThemeVars, getTables } from '@/lib/stores/config';
import { createClient } from '@/lib/supabase/server';

interface AdminStoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}

/**
 * Applies the tenant palette to admin pages and rejects unknown store slugs.
 * The sidebar lives in the parent layout, so it keeps the platform palette.
 *
 * Access is store-scoped: a signed-in user may only open the console of a
 * store whose profile table grants them a staff role. This prevents one
 * tenant's session from reaching another tenant's admin by URL.
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from(getTables(store.slug).profiles)
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isStaff = profile?.role === 'super_admin' || profile?.role === 'store_manager';
  if (!isStaff) {
    notFound();
  }

  return (
    <div style={getStoreThemeVars(store.theme) as React.CSSProperties} data-admin-store={store.slug}>
      {children}
    </div>
  );
}

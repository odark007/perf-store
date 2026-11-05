import { redirect } from 'next/navigation';

interface AdminStoreIndexProps {
  params: Promise<{ store: string }>;
}

/** /admin/<store> → that store's dashboard. */
export default async function AdminStoreIndex({ params }: AdminStoreIndexProps) {
  const { store } = await params;
  redirect(`/admin/${store}/dashboard`);
}

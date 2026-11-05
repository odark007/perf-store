import { redirect } from 'next/navigation';
import { getCurrentStoreSlug } from '@/lib/stores/context';

export default async function CreateProductRedirectPage() {
  const storeSlug = await getCurrentStoreSlug();

  redirect(`/admin/${storeSlug}/products/create`);
}
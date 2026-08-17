import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getTables } from '@/lib/stores/config';
import PostForm from '@/components/admin/blog/PostForm';

interface PageProps {
  params: Promise<{ id: string; store: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id, store: storeSlug } = await params;
  const t = getTables(storeSlug);
  const supabase = await createClient();
  const { data: post } = await supabase.from(t.posts).select('*').eq('id', id).single();

  if (!post) return <div>Post not found</div>;

  return <PostForm initialData={post} />;
}
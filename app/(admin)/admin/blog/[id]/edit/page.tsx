import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PostForm from '@/components/admin/blog/PostForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();

  if (!post) return <div>Post not found</div>;

  return <PostForm initialData={post} />;
}
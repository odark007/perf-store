'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper for Slug Generation
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces with -
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string; // HTML string
    const excerpt = formData.get('excerpt') as string;
    const cover_image_url = formData.get('cover_image_url') as string;
    const is_published = formData.get('is_published') === 'true';
    
    // Auto-generate slug (add random string to avoid collision)
    const slug = `${generateSlug(title)}-${Date.now().toString().slice(-4)}`;

    const { error } = await supabase.from('posts').insert({
      title,
      slug,
      content,
      excerpt,
      cover_image_url,
      is_published,
      published_at: is_published ? new Date().toISOString() : null
    });

    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const cover_image_url = formData.get('cover_image_url') as string;
    const is_published = formData.get('is_published') === 'true';
    // We don't update slug to preserve SEO

    const { error } = await supabase.from('posts').update({
      title,
      content,
      excerpt,
      cover_image_url,
      is_published,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (error) throw error;

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // 1. Get the post to find the image URL
  const { data: post } = await supabase
    .from('posts')
    .select('cover_image_url')
    .eq('id', id)
    .single();

  // 2. Delete the Image from Storage (if it exists and is ours)
  if (post?.cover_image_url && post.cover_image_url.includes('blog-images')) {
    try {
      const path = post.cover_image_url.split('/blog-images/')[1];
      if (path) {
        await supabase.storage.from('blog-images').remove([path]);
      }
    } catch (err) {
      console.error("Failed to cleanup image", err);
    }
  }

  // 3. Delete the Post Row
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  return { success: true };
}
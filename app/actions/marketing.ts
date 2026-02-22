'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to check Admin
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return supabase;
}

export async function createCampaign(formData: FormData) {
  try {
    const supabase = await checkAdmin();

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_type: formData.get('media_type') as 'image' | 'youtube',
      media_url: formData.get('media_url') as string,
      cta_text: formData.get('cta_text') as string,
      cta_link: formData.get('cta_link') as string,
      start_at: formData.get('start_at') || null,
      end_at: formData.get('end_at') || null,
      is_active: formData.get('is_active') === 'true',
    };

    const { error } = await supabase.from('marketing_campaigns').insert(data);
    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/marketing');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCampaign(id: string) {
  try {
    const supabase = await checkAdmin();

    // 1. Get Campaign to check for Image
    const { data: campaign } = await supabase
      .from('marketing_campaigns')
      .select('media_url, media_type')
      .eq('id', id)
      .single();

    // 2. Clean up Storage (Ghost File Logic)
    if (campaign && campaign.media_type === 'image' && campaign.media_url.includes('marketing-assets')) {
      try {
        const path = campaign.media_url.split('/marketing-assets/')[1];
        if (path) {
          await supabase.storage.from('marketing-assets').remove([path]);
        }
      } catch (err) {
        console.error("Failed to delete banner image", err);
      }
    }

    // 3. Delete DB Row
    const { error } = await supabase.from('marketing_campaigns').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/marketing');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleCampaignStatus(id: string, currentStatus: boolean) {
  try {
    const supabase = await checkAdmin();
    await supabase.from('marketing_campaigns').update({ is_active: !currentStatus }).eq('id', id);
    revalidatePath('/admin/marketing');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}


export async function updateCampaign(id: string, formData: FormData) {
  try {
    const supabase = await checkAdmin();

    const media_type = formData.get('media_type') as 'image' | 'youtube';
    const media_url = formData.get('media_url') as string;

    // 1. Ghost File Cleanup logic
    const { data: oldCampaign } = await supabase
      .from('marketing_campaigns')
      .select('media_url, media_type')
      .eq('id', id)
      .single();

    if (oldCampaign && oldCampaign.media_url !== media_url) {
      if (oldCampaign.media_type === 'image' && oldCampaign.media_url.includes('marketing-assets')) {
        try {
          const path = oldCampaign.media_url.split('/marketing-assets/')[1];
          if (path) await supabase.storage.from('marketing-assets').remove([path]);
        } catch (err) {
          console.error("Image cleanup failed", err);
        }
      }
    }

    // 2. Prepare Data
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      media_type,
      media_url,
      cta_text: formData.get('cta_text') as string,
      cta_link: formData.get('cta_link') as string,
      start_at: formData.get('start_at') || null,
      end_at: formData.get('end_at') || null,
      is_active: formData.get('is_active') === 'true',
    };

    // 3. Update DB
    const { error } = await supabase
      .from('marketing_campaigns')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/marketing');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
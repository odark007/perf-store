'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper: Check Super Admin
async function checkSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') throw new Error('Permission Denied');
  
  return supabase;
}

// --- STORE SETTINGS ---
export async function updateGeneralSettings(formData: FormData) {
  try {
    const supabase = await checkSuperAdmin();
    
    const whatsapp_phone = formData.get('whatsapp_phone') as string;
    const primary_phone = formData.get('primary_phone') as string;
    const enable_outside_accra = formData.get('enable_outside_accra') === 'on';
    const enable_international = formData.get('enable_international') === 'on';
    const bulk_threshold = Number(formData.get('bulk_threshold'));
    const bulk_surcharge = Number(formData.get('bulk_surcharge'));

    const { error } = await supabase
      .from('store_settings')
      .update({
        whatsapp_phone,
        primary_phone,
        enable_outside_accra,
        enable_international,
        bulk_threshold,
        bulk_surcharge
      })
      .eq('id', 1);

    if (error) throw error;
    revalidatePath('/admin/settings');
    revalidatePath('/contact');
    return { success: true, message: 'Settings updated' };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- DELIVERY ZONES ---
export async function upsertZone(data: any) {
  try {
    const supabase = await checkSuperAdmin();
    const { error } = await supabase.from('delivery_zones').upsert(data).select();
    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteZone(id: string) {
  try {
    const supabase = await checkSuperAdmin();
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- TAXES ---
export async function upsertTax(data: any) {
  try {
    const supabase = await checkSuperAdmin();
    const { error } = await supabase.from('taxes').upsert(data).select();
    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTax(id: string) {
  try {
    const supabase = await checkSuperAdmin();
    const { error } = await supabase.from('taxes').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// --- NOTIFICATIONS ---

export async function updateNotificationSettings(formData: FormData) {
  try {
    const supabase = await checkSuperAdmin();
    
    // Toggles
    const master_sms_enabled = formData.get('master_sms_enabled') === 'on';
    const master_email_enabled = formData.get('master_email_enabled') === 'on';
    const enable_admin_alerts = formData.get('enable_admin_alerts') === 'on';
    const enable_customer_alerts = formData.get('enable_customer_alerts') === 'on';
    
    // Contacts
    const enable_backup_phone = formData.get('enable_backup_phone') === 'on';
    const backup_admin_phone = formData.get('backup_admin_phone') as string;
    const admin_alert_email = formData.get('admin_alert_email') as string;

    const { error } = await supabase
      .from('store_settings')
      .update({
        master_sms_enabled,
        master_email_enabled,
        enable_admin_alerts,
        enable_customer_alerts,
        enable_backup_phone,
        backup_admin_phone,
        admin_alert_email
      })
      .eq('id', 1);

    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true, message: 'Notification settings updated' };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTemplate(triggerId: string, formData: FormData) {
  try {
    const supabase = await checkSuperAdmin();
    
    const sms_template = formData.get('sms_template') as string;
    const email_subject = formData.get('email_subject') as string;
    const email_body = formData.get('email_body') as string;
    const is_active = formData.get('is_active') === 'on';

    const { error } = await supabase
      .from('notification_templates')
      .update({
        sms_template,
        email_subject,
        email_body,
        is_active
      })
      .eq('trigger_id', triggerId);

    if (error) throw error;
    revalidatePath('/admin/settings');
    return { success: true, message: 'Template updated' };
  } catch (error: any) {
    return { error: error.message };
  }
}
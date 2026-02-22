import { createClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms';
import { formatCurrency } from '@/lib/utils';

// Helper to generate HTML Table for Email
const generateInvoiceHTML = (items: any[], totals: { subtotal: number, tax: number, delivery: number, total: number }) => {
  if (!items || items.length === 0) return '';

  // 1. Generate Item Rows
  const itemRows = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_title} (${item.variant_name})</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  // 2. Generate Footer Rows
  const footerRows = `
    <tr>
      <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ccc;">Subtotal:</td>
      <td style="padding: 8px; text-align: right; border-top: 2px solid #ccc;">${formatCurrency(totals.subtotal)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 8px; text-align: right;">Tax:</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(totals.tax)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 8px; text-align: right;">Delivery:</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(totals.delivery)}</td>
    </tr>
    <tr style="background-color: #f3f4f6;">
      <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">TOTAL:</td>
      <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 16px;">${formatCurrency(totals.total)}</td>
    </tr>
  `;

  return `
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
      <thead>
        <tr style="background-color: #333; color: #fff; text-align: left;">
          <th style="padding: 10px;">Item</th>
          <th style="padding: 10px; text-align: center;">Qty</th>
          <th style="padding: 10px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${footerRows}
      </tbody>
    </table>
  `;
};

// Main Notification Function
export async function sendNotification(triggerId: string, orderData: any) {
  console.log(`[Notification] Triggered: ${triggerId} for Order: ${orderData.order_number}`);

  try {
    const supabase = await createClient();

    // 1. Fetch Global Settings
    const { data: settings, error: settingsError } = await supabase.from('store_settings').select('*').single();

    if (settingsError || !settings) {
      console.error("[Notification] Failed to fetch settings:", settingsError);
      return;
    }

    // 2. Fetch Template
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('trigger_id', triggerId)
      .single();

    if (templateError || !template) {
      console.error(`[Notification] Template not found for trigger: ${triggerId}`);
      return;
    }

    if (!template.is_active) {
      console.log(`[Notification] Template ${triggerId} is inactive.`);
      return;
    }

    // 3. Prepare Variables
    const totals = {
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      delivery: orderData.delivery || 0,
      total: orderData.total_amount || 0
    };

    const invoiceHTML = generateInvoiceHTML(orderData.items, totals);

    // Validate Customer Name (Fallback logic)
    const validCustomerName = orderData.customer_name && orderData.customer_name.trim() !== ''
      ? orderData.customer_name
      : "Customer";

    const vars = {
      '{{order_number}}': orderData.order_number,
      '{{customer_name}}': validCustomerName,
      '{{total}}': formatCurrency(orderData.total_amount),
      '{{invoice_table}}': invoiceHTML
    };

    const replaceVars = (text: string) => {
      let result = text || '';
      Object.entries(vars).forEach(([key, value]) => {
        // Use a global, case-insensitive replacement if needed, but standard logic assumes exact match
        result = result.replace(new RegExp(key, 'g'), value as string);
      });
      return result;
    };

    const smsBody = replaceVars(template.sms_template);
    const emailSubject = replaceVars(template.email_subject);
    const emailBody = replaceVars(template.email_body);

    console.log(`[Notification] Prepared content. Subject: ${emailSubject}`);

    // --- ROUTING LOGIC ---

    // A. ADMIN ALERTS
    if (triggerId.includes('admin')) {
      if (!settings.enable_admin_alerts) {
        console.log(`[Notification] Admin alerts disabled in settings.`);
        return;
      }

      console.log(`[Notification] Sending Admin Alerts...`);

      if (settings.master_sms_enabled && settings.whatsapp_phone) {
        await sendSMS(settings.whatsapp_phone, smsBody);
      }

      // Fixed Backup Phone Logic (Ensure variable name matches DB column exactness)
      if (settings.master_sms_enabled && settings.enable_backup_phone && settings.backup_admin_phone) {
        console.log(`[Notification] Sending Backup SMS to ${settings.backup_admin_phone}`);
        await sendSMS(settings.backup_admin_phone, smsBody);
      }

      if (settings.master_email_enabled && settings.admin_alert_email) {
        await sendEmailJS(settings.admin_alert_email, emailSubject, emailBody);
      }
    }

    // B. CUSTOMER ALERTS
    else if (triggerId.includes('customer') || triggerId.includes('status') || triggerId.includes('payment')) {
      if (!settings.enable_customer_alerts) {
        console.log(`[Notification] Customer alerts disabled in settings.`);
        return;
      }

      // Special Check for Payment methods that might delay confirmation?
      // No, we just send if triggered.

      console.log(`[Notification] Sending Customer Alerts to: ${orderData.user_email} / ${orderData.user_phone}`);

      if (settings.master_sms_enabled && orderData.user_phone) {
        await sendSMS(orderData.user_phone, smsBody);
      }

      if (settings.master_email_enabled && orderData.user_email) {
        await sendEmailJS(orderData.user_email, emailSubject, emailBody);
      }
    }

  } catch (error) {
    console.error("[Notification] Critical Error:", error);
  }
}

// Helper for EmailJS
async function sendEmailJS(toEmail: string, subject: string, htmlBody: string) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !userId || !privateKey) {
    console.error("[Notification] Missing EmailJS env credentials.");
    return;
  }

  try {
    const data = {
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      accessToken: privateKey,
      template_params: {
        to_email: toEmail,
        subject: subject,
        message_html: htmlBody
      }
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[Notification] EmailJS Error (${res.status}): ${txt}`);
    } else {
      console.log(`[Notification] Email Sent to ${toEmail}`);
    }

  } catch (error) {
    console.error("[Notification] Email Send Failed", error);
  }
}
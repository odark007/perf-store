'use client';

import React, { useState } from 'react';
import { Save, Bell, Smartphone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { updateNotificationSettings, updateTemplate } from '@/app/actions/settings';

interface Props {
  settings: any;
  templates: any[];
}

const NotificationSettings: React.FC<Props> = ({ settings, templates }) => {
  const [loading, setLoading] = useState(false);

  async function handleGlobalSave(formData: FormData) {
    setLoading(true);
    await updateNotificationSettings(formData);
    setLoading(false);
    alert('Global settings saved!');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-secondary-900">Notifications & Alerts</h2>
      </div>

      {/* 1. GLOBAL SWITCHES */}
      <form action={handleGlobalSave} className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2 border-b border-secondary-100 pb-2">
          <Bell className="text-primary-600" size={20} />
          Master Controls
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Master Toggles */}
          <div className="space-y-4">
            <Toggle label="Master SMS Enabled" name="master_sms_enabled" checked={settings.master_sms_enabled} desc="If OFF, no SMS will ever be sent." />
            <Toggle label="Master Email Enabled" name="master_email_enabled" checked={settings.master_email_enabled} desc="If OFF, no Emails will ever be sent." />
          </div>
          <div className="space-y-4">
            <Toggle label="Enable Admin Alerts" name="enable_admin_alerts" checked={settings.enable_admin_alerts} desc="Notify you when orders arrive." />
            <Toggle label="Enable Customer Alerts" name="enable_customer_alerts" checked={settings.enable_customer_alerts} desc="Send receipts and updates to customers." />
          </div>
        </div>

        <h4 className="font-bold text-sm text-secondary-500 uppercase tracking-wide mt-4">Admin Contacts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium mb-1">Admin Email (For Alerts)</label>
             <input name="admin_alert_email" defaultValue={settings.admin_alert_email} className="w-full p-2 border rounded-lg" placeholder="admin@shop.com" />
           </div>
           <div className="space-y-2">
             <Toggle label="Enable Backup Phone" name="enable_backup_phone" checked={settings.enable_backup_phone} />
             <input name="backup_admin_phone" defaultValue={settings.backup_admin_phone} className="w-full p-2 border rounded-lg" placeholder="Backup Phone Number" />
           </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={loading} leftIcon={<Save size={18} />}>Save Global Settings</Button>
        </div>
      </form>

      {/* 2. TEMPLATE EDITOR */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-secondary-900">Message Templates</h3>
        <div className="space-y-4">
          {templates.map(t => <TemplateEditor key={t.trigger_id} template={t} />)}
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual templates
const TemplateEditor = ({ template }: { template: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(formData: FormData) {
    setLoading(true);
    await updateTemplate(template.trigger_id, formData);
    setLoading(false);
    alert('Template updated!');
  }

  return (
    <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-secondary-50 hover:bg-secondary-100 transition-colors text-left">
        <div>
          <p className="font-bold text-secondary-900">{template.name}</p>
          <p className="text-xs text-secondary-500 font-mono">ID: {template.trigger_id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-1 rounded ${template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {template.is_active ? 'Active' : 'Disabled'}
          </span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isOpen && (
        <form action={handleSave} className="p-6 border-t border-secondary-200 space-y-4 animate-fade-in">
          <Toggle label="Enable this specific notification" name="is_active" checked={template.is_active} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-secondary-700">
                <Smartphone size={16} /> SMS Template
              </label>
              <textarea name="sms_template" rows={4} defaultValue={template.sms_template} className="w-full p-3 border rounded-lg text-sm" />
              <p className="text-xs text-secondary-400">Available variables: {'{{order_number}}'}, {'{{customer_name}}'}, {'{{total}}'}</p>
            </div>
            
            {/* Email */}
            <div className="space-y-2">
               <label className="flex items-center gap-2 text-sm font-bold text-secondary-700">
                <Mail size={16} /> Email Subject
              </label>
              <input name="email_subject" defaultValue={template.email_subject} className="w-full p-2 border rounded-lg text-sm" />
              
              <label className="flex items-center gap-2 text-sm font-bold text-secondary-700 mt-2">
                Email Body (HTML supported)
              </label>
              <textarea name="email_body" rows={4} defaultValue={template.email_body} className="w-full p-3 border rounded-lg text-sm font-mono" />
              <p className="text-xs text-secondary-400">Variables: {'{{invoice_table}}'} (Auto-generated table)</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" isLoading={loading}>Save Template</Button>
          </div>
        </form>
      )}
    </div>
  );
};

// Helper for Toggles
const Toggle = ({ label, name, checked, desc }: any) => (
  <div className="flex items-start gap-3">
    <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded" />
    <div>
      <label className="block text-sm font-medium text-secondary-900">{label}</label>
      {desc && <p className="text-xs text-secondary-500">{desc}</p>}
    </div>
  </div>
);

export default NotificationSettings;
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string; // Keep for legacy/UI display
  category_id?: string; // New Link
  base_image_url: string;
  is_active: boolean;
  brand: string;
  is_featured: boolean;
  variants?: ProductVariant[];
  discount_percent: number;
  discount_start_at?: string | null; // ISO Date String
  discount_end_at?: string | null;   // ISO Date String
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string; // e.g., 'Single', '6-Pack'
  type: 'single' | 'pack' | 'crate';
  price: number;
  stock_deduction: number;
  sku: string;
  inventory?: {
    current_stock_level: number;
  };
  stock?: number;
}

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  stockDeduction: number; // e.g., 1, 6, 24
  masterStockTotal: number; // The shared pool total (e.g., 100 bottles)
  maxStock?: number; // Optional purely for UI (CartDrawer)
}

export interface Order {
  id: string;
  order_number: number;
  user_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_status: 'processing' | 'ready' | 'dispatched' | 'delivered';
  delivery_address: string;
  notes: string;
  created_at: string;
  tax_amount: number;
  discount_amount: number;
}

export interface StoreSettings {
  whatsapp_phone: string;
  primary_phone: string;
  support_email: string;
  enable_outside_accra: boolean;
  enable_international: boolean;
  bulk_threshold: number;
  bulk_surcharge: number;
  master_sms_enabled: boolean;
  master_email_enabled: boolean;
  enable_admin_alerts: boolean;
  enable_customer_alerts: boolean;
  backup_admin_phone?: string;
  enable_backup_phone: boolean;
  admin_alert_email?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  region_category: 'accra_subzone' | 'regional' | 'international';
  base_price: number;
  is_active: boolean;
}

export interface Tax {
  id: string;
  name: string;
  rate_percent: number;
  is_active: boolean;
}

export interface NotificationTemplate {
  trigger_id: string;
  name: string;
  sms_template: string;
  email_subject: string;
  email_body: string;
  is_active: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  seo_title?: string;
  seo_description?: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  description: string;
  media_type: 'image' | 'youtube';
  media_url: string;
  cta_text: string;
  cta_link: string;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  created_at: string;
}

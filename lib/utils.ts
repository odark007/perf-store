import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind helper (standard best practice)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Money Formatter (e.g., 3025.00 -> GH₵3,025.00)
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
}

interface DiscountableProduct {
  is_featured?: boolean;
  discount_percent?: number;
  discount_start_at?: string | null;
  discount_end_at?: string | null;
}

export function getDiscountedPrice(originalPrice: number, product: DiscountableProduct) {
  const { is_featured, discount_percent, discount_start_at, discount_end_at } = product;

  // 1. Basic Eligibility Check
  if (!is_featured || !discount_percent || discount_percent <= 0) {
    return { finalPrice: originalPrice, isOnSale: false, originalPrice };
  }

  // 2. Date Check
  const now = new Date();

  // If Start Date exists and is in the future -> Not active yet
  if (discount_start_at && new Date(discount_start_at) > now) {
    return { finalPrice: originalPrice, isOnSale: false, originalPrice };
  }

  // If End Date exists and is in the past -> Expired
  if (discount_end_at && new Date(discount_end_at) < now) {
    return { finalPrice: originalPrice, isOnSale: false, originalPrice };
  }

  // 3. Calculate Discount
  const discountAmount = originalPrice * (discount_percent / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    finalPrice,
    isOnSale: true,
    originalPrice
  };
}

export function formatPhoneForGH(phone: string) {
  // Remove spaces and non-numeric chars
  let clean = phone.replace(/\D/g, '');

  // If starts with '0', remove it and add '233'
  if (clean.startsWith('0')) {
    clean = '233' + clean.substring(1);
  }
  // If just 9 digits (e.g. 244...), add 233
  else if (clean.length === 9) {
    clean = '233' + clean;
  }
  
  return clean;
}

export function getYoutubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
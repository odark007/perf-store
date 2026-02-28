'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Users,
  Tag,
  BookOpen // For Blog
} from 'lucide-react';
import { signOutAction } from '@/app/auth/actions';
import { Megaphone } from 'lucide-react';

const AdminSidebar = () => {
  const pathname = usePathname();

  const links = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', href: '/admin/inventory', icon: Package },
    { label: 'Categories', href: '/admin/inventory/categories', icon: Tag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Blog', href: '/admin/blog', icon: BookOpen },
    { label: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    // FIX 1: Changed min-h-screen to h-screen and removed overflow-y-auto from parent
    <aside className="w-64 bg-brand-cream border-r border-brand-border text-brand-deep h-screen flex flex-col fixed left-0 top-0 shadow-lg">

      {/* Header - Fixed at top */}
      <div className="p-6 border-b border-brand-border flex-shrink-0">
        <h2 className="text-xl font-display font-bold text-brand-deep">Admin Panel</h2>
        <p className="text-xs text-brand-gold font-bold uppercase tracking-wider">Perfume Boutique</p>
      </div>

      {/* Navigation - Takes remaining space and scrolls */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {links.map((link) => {
          // Check if link is active (simple includes check for sub-routes)
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-brand-deep text-white shadow-md' : 'text-brand-muted hover:bg-brand-gold/10 hover:text-brand-deep'}
              `}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout - Fixed at bottom */}
      <div className="p-4 border-t border-brand-border flex-shrink-0 bg-brand-cream z-10">
        <form action={signOutAction}>
          <button type="submit" className="flex w-full items-center gap-3 px-4 py-3 text-brand-muted hover:text-danger hover:bg-danger/5 rounded-lg transition-colors text-left">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
};

export default AdminSidebar;
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Wine,
  Beer,
  Martini,
  User,
  LogOut,
  Clock,
  GlassWater
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useCartStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();

  // FIX: Select specific state pieces to trigger re-renders correctly
  const items = useCartStore((state) => state.items);
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    setIsMounted(true);

    const supabase = createClient();
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scroll Down -> Hide
          setIsVisible(false);
          setIsMobileMenuOpen(false); // Close mobile menu if scrolling down
        } else {
          // Scroll Up -> Show
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  // FIX: Calculate count directly in render to ensure reactivity
  const cartItemCount = isMounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  const navLinks = [
    { label: 'All Products', href: '/shop' },
    { label: 'Beer', href: '/shop?category=beer', icon: Beer },
    { label: 'Wine', href: '/shop?category=wine', icon: Wine },
    { label: 'Spirits', href: '/shop?category=spirits', icon: Martini },
    { label: 'Soft Drinks', href: '/shop?category=soft-drinks', icon: GlassWater },
  ];

  return (
    <header className={`sticky top-0 z-[var(--z-sticky)] bg-white/95 backdrop-blur-md border-b border-secondary-200 shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container-custom h-[var(--header-height-mobile)] md:h-[var(--header-height)] flex items-center justify-between">

        {/* 1. Logo */}
        <Link href="/" className="flex items-center gap-2 z-20">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-white text-lg md:text-xl">L</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg md:text-xl leading-none text-secondary-900">
              LiquorShop
            </span>
            <span className="text-[10px] uppercase tracking-widest text-secondary-500 font-medium">
              Ghana
            </span>
          </div>
        </Link>

        {/* 2. Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 3. Actions */}
        <div className="flex items-center gap-2 md:gap-4 z-20">

          {/* User Menu (Desktop) */}
          <div className="relative hidden md:block">
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
              >
                <User size={24} className="text-primary-600" />
              </button>
            ) : (
              <Link href="/auth/login" className="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-700 font-medium text-sm flex items-center gap-1">
                <User size={20} />
                <span>Login</span>
              </Link>
            )}

            {/* Click Outside Overlay */}
            {isUserMenuOpen && (
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setIsUserMenuOpen(false)}
              />
            )}

            {/* User Dropdown */}
            {isUserMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-secondary-100 py-2 animate-scale-in origin-top-right z-40">
                <div className="px-4 py-3 border-b border-secondary-50">
                  <p className="text-xs text-secondary-500 font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-secondary-900 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/account/history"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Clock size={16} className="text-secondary-400" />
                    Order History
                  </Link>
                </div>

                <div className="border-t border-secondary-50 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            onClick={(e) => {
              e.preventDefault();
              toggleCart();
            }}
            className="relative p-2 hover:bg-secondary-100 rounded-full transition-colors group"
          >
            <ShoppingCart size={24} className="text-secondary-700 group-hover:text-primary-600" />
            {cartItemCount > 0 ? (
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
                <Badge variant="danger" size="sm" className="px-1.5 h-5 min-w-[20px] shadow-sm border-white">
                  {cartItemCount}
                </Badge>
              </span>
            ) : (
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-300 rounded-full border-2 border-white group-hover:bg-primary-500 transition-colors" />
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-secondary-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-[var(--header-height-mobile)] left-0 w-full bg-secondary-50 border-b border-secondary-200 shadow-lg md:hidden animate-slide-down h-[calc(100vh-var(--header-height-mobile))] overflow-y-auto z-40">

          <div className="p-4 border-b border-secondary-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg outline-none focus:border-primary-500"
              />
              <Search size={20} className="absolute left-3 top-3.5 text-secondary-400" />
            </div>
          </div>

          <nav className="p-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-4 text-secondary-700 hover:bg-secondary-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && <link.icon size={20} className="text-secondary-400" />}
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}

            <div className="h-px bg-secondary-100 my-2" />

            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-xs text-secondary-500">Signed in as</p>
                  <p className="text-sm font-bold text-secondary-900">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-red-50 rounded-lg text-left font-medium"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 p-4 text-primary-600 hover:bg-primary-50 rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} />
                Login / Sign Up
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
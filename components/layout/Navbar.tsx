'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Clock,
  Heart,
  Sparkles
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useCartStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
          setIsVisible(false);
          setIsMobileMenuOpen(false);
        } else {
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

  const cartItemCount = isMounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  const navLinks = [
    { label: 'All Fragrances', href: '/shop' },
    { label: "Men's", href: '/shop?category=mens' },
    { label: "Women's", href: '/shop?category=womens' },
    { label: 'Unisex & Niche', href: '/shop?category=unisex' },
    { label: 'Gift Sets', href: '/shop?category=gift-sets' },
    { label: 'Body Mists', href: '/shop?category=body-mists' },
  ];

  const isActive = (href: string) => {
    if (href === '/shop') return pathname === '/shop' && !searchParams.get('category');
    return pathname === '/shop' && searchParams.get('category') === href.split('category=')[1];
  };

  return (
    <header className={`sticky top-0 z-[var(--z-sticky)] bg-[#1a0a2e]/92 backdrop-blur-xl border-b border-[rgba(201,168,76,0.25)] transition-transform duration-300 h-18 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container-custom h-full flex items-center justify-between">

        {/* 1. Logo */}
        <Link href="/" className="flex items-center gap-3 z-20 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] rounded-full flex items-center justify-center shadow-lg shadow-gold/20 transition-transform group-hover:scale-105">
            <span className="font-display font-bold text-[#1a0a2e] text-xl">P</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg md:text-xl leading-none text-[#c9a84c] tracking-tight uppercase">
              The Perfume Store
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-pale/60 font-medium font-body mt-0.5">
              Ghana
            </span>
          </div>
        </Link>

        {/* 2. Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-[12px] font-medium tracking-[0.15em] uppercase font-body transition-colors duration-200 ${isActive(link.href) ? 'text-[#c9a84c]' : 'text-[#c4b8d4] hover:text-[#c9a84c]'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 3. Actions */}
        <div className="flex items-center gap-2 md:gap-3 z-20">

          {/* Wishlist Link */}
          <Link href="/wishlist" className="p-2 text-[#c4b8d4] hover:text-[#c9a84c] transition-colors">
            <Heart size={22} />
          </Link>

          {/* User Menu (Desktop) */}
          <div className="relative hidden md:block">
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2 text-[#c4b8d4] hover:text-[#c9a84c] transition-colors"
                aria-label="User menu"
              >
                <User size={22} />
              </button>
            ) : (
              <Link href="/auth/login" className="p-2 text-[#c4b8d4] hover:text-[#c9a84c] transition-colors text-sm font-medium flex items-center gap-2">
                <User size={20} />
                <span className="hidden lg:inline uppercase tracking-wider text-[11px]">Login</span>
              </Link>
            )}

            {isUserMenuOpen && (
              <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsUserMenuOpen(false)} />
            )}

            {isUserMenuOpen && user && (
              <div className="absolute right-0 mt-3 w-64 bg-[#2d1554] rounded-xl shadow-2xl border border-[rgba(201,168,76,0.2)] py-2 animate-scale-in origin-top-right z-40">
                <div className="px-5 py-4 border-b border-[rgba(201,168,76,0.1)]">
                  <p className="text-[10px] text-gold-pale/50 font-bold uppercase tracking-widest mb-1">Authenticated</p>
                  <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    href="/account/history"
                    className="flex items-center gap-3 px-5 py-3 text-sm text-[#c4b8d4] hover:text-[#c9a84c] hover:bg-[#1a0a2e]/40 transition-all font-medium"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Clock size={16} />
                    Order History
                  </Link>
                  {user.role === 'store_manager' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-5 py-3 text-sm text-[#c4b8d4] hover:text-[#c9a84c] hover:bg-[#1a0a2e]/40 transition-all font-medium"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Sparkles size={16} />
                      Admin Panel
                    </Link>
                  )}
                </div>

                <div className="border-t border-[rgba(201,168,76,0.1)] pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all font-medium text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button
            onClick={toggleCart}
            className="relative p-2 text-[#c4b8d4] hover:text-[#c9a84c] transition-colors group"
            aria-label="Toggle cart"
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 ? (
              <span className="absolute -top-1 -right-1">
                <Badge variant="danger" size="sm" className="px-1.5 h-5 min-w-[20px] shadow-lg border-[#1a0a2e] border-2 bg-[#c9a84c] text-[#1a0a2e]">
                  {cartItemCount}
                </Badge>
              </span>
            ) : null}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-[#c9a84c]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-18 left-0 w-full bg-[#1a0a2e] border-b border-[rgba(201,168,76,0.25)] shadow-2xl lg:hidden animate-slide-down h-[calc(100vh-4.5rem)] overflow-y-auto z-40">
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-4 p-4 rounded-xl font-medium transition-all ${isActive(link.href) ? 'bg-[#2d1554] text-[#c9a84c]' : 'text-[#c4b8d4]'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="uppercase tracking-[0.2em] text-xs">{link.label}</span>
              </Link>
            ))}

            <div className="h-px bg-[rgba(201,168,76,0.1)] my-4" />

            {user ? (
              <div className="p-4 bg-[#2d1554] rounded-2xl border border-[rgba(201,168,76,0.1)]">
                <p className="text-[10px] text-gold-pale/50 font-bold uppercase tracking-widest mb-1">Welcome</p>
                <p className="text-sm font-semibold text-white mb-4">{user.email}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/account/history" className="flex items-center justify-center gap-2 p-3 bg-[#1a0a2e] rounded-lg text-[#c4b8d4]" onClick={() => setIsMobileMenuOpen(false)}>
                    <Clock size={16} /> <span className="text-[10px] font-bold uppercase">History</span>
                  </Link>
                  <button onClick={handleSignOut} className="flex items-center justify-center gap-2 p-3 bg-red-900/10 rounded-lg text-red-400">
                    <LogOut size={16} /> <span className="text-[10px] font-bold uppercase">Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#1a0a2e] rounded-xl font-bold uppercase tracking-widest text-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={18} />
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

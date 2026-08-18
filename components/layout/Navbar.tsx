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
  Sparkles,
  Bot,
  Gamepad2
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { useCartStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface NavbarProps {
  storeSlug?: string;
}

const Navbar = ({ storeSlug = 'derme' }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isToyShop = storeSlug === 'play-time';

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

  // Nav links per store
  const perfumeNavLinks = [
    { label: 'All Fragrances', href: `/${storeSlug}/shop` },
    { label: "Men's", href: `/${storeSlug}/shop?category=mens` },
    { label: "Women's", href: `/${storeSlug}/shop?category=womens` },
    { label: 'Unisex & Niche', href: `/${storeSlug}/shop?category=unisex` },
    { label: 'Gift Sets', href: `/${storeSlug}/shop?category=gift-sets` },
    { label: 'Body Mists', href: `/${storeSlug}/shop?category=body-mists` },
  ];

  const toyNavLinks = [
    { label: 'Home', href: `/${storeSlug}` },
    { label: 'Shop All', href: `/${storeSlug}/shop` },
    { label: 'RC Vehicles', href: `/${storeSlug}/shop?category=rc-vehicles` },
    { label: 'Robotics', href: `/${storeSlug}/shop?category=robotics` },
    { label: 'Camera & VR', href: `/${storeSlug}/shop?category=camera-vr` },
    { label: 'App-Controlled', href: `/${storeSlug}/shop?category=app-controlled` },
    { label: 'AI-Powered', href: `/${storeSlug}/shop?category=ai-powered` },
  ];

  const navLinks = isToyShop ? toyNavLinks : perfumeNavLinks;

  const isActive = (href: string) => {
    if (href === `/${storeSlug}`) return pathname === `/${storeSlug}`;
    if (href === `/${storeSlug}/shop`) return pathname === `/${storeSlug}/shop` && !searchParams.get('category');
    return pathname === `/${storeSlug}/shop` && searchParams.get('category') === href.split('category=')[1];
  };

  // =========================================================================
  // TOY SHOP NAVBAR
  // =========================================================================
  if (isToyShop) {
    return (
      <header
        className={`sticky top-0 z-[var(--z-sticky)] bg-[#f5f3fc]/90 backdrop-blur-md border-b border-[#e2ddf7] transition-transform duration-300 h-[72px] ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container-custom h-full flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${storeSlug}`} className="flex items-center gap-3 z-20 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c7ef6] to-[#7be8ff] relative shadow-sm flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-[#f5f3fc] rounded-md animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-[#23213d] tracking-tight font-display">
                Tomorrow&apos;s Playground
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c7ef6] font-semibold font-mono">
                RC & Robotics
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[13px] font-semibold font-body transition-colors relative py-1 ${
                  isActive(link.href)
                    ? 'text-[#23213d] after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[3px] after:bg-[#ff8f66] after:rounded-full'
                    : 'text-[#5b5876] hover:text-[#6857e8]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2 md:gap-3 z-20">
            {/* Search link */}
            <Link
              href={`/${storeSlug}/shop`}
              className="w-10 h-10 rounded-full bg-white border border-[#e2ddf7] grid place-items-center text-[#23213d] hover:-translate-y-0.5 hover:shadow-sm transition-all"
              aria-label="Search toys"
            >
              <Search size={18} />
            </Link>

            {/* User Menu */}
            <div className="relative hidden md:block">
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 rounded-full bg-white border border-[#e2ddf7] grid place-items-center text-[#23213d] hover:-translate-y-0.5 hover:shadow-sm transition-all"
                  aria-label="User menu"
                >
                  <User size={18} />
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-full bg-white border border-[#e2ddf7] text-[#23213d] hover:border-[#8c7ef6] hover:text-[#6857e8] transition-all text-xs font-bold font-body inline-flex items-center gap-1.5"
                >
                  <User size={15} />
                  <span>Login</span>
                </Link>
              )}

              {isUserMenuOpen && (
                <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsUserMenuOpen(false)} />
              )}

              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-[#e2ddf7] py-2 origin-top-right z-40">
                  <div className="px-4 py-3 border-b border-[#ecebfa]">
                    <p className="text-[10px] text-[#5b5876] font-bold uppercase tracking-widest font-mono">Account</p>
                    <p className="text-xs font-semibold text-[#23213d] truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={`/${storeSlug}/account/history`}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#23213d] hover:bg-[#f5f3fc] transition-all font-semibold font-body"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Clock size={14} /> Order History
                    </Link>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#6857e8] hover:bg-[#f5f3fc] transition-all font-semibold font-body"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Sparkles size={14} /> Admin Portal
                    </Link>
                  </div>
                  <div className="border-t border-[#ecebfa] pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-all font-semibold font-body text-left"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative w-10 h-10 rounded-full bg-white border border-[#e2ddf7] grid place-items-center text-[#23213d] hover:-translate-y-0.5 hover:shadow-sm transition-all"
              aria-label="Toggle cart"
            >
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff8f66] text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full grid place-items-center border-2 border-[#f5f3fc]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden w-10 h-10 rounded-full bg-white border border-[#e2ddf7] grid place-items-center text-[#23213d]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-[72px] left-0 w-full bg-[#f5f3fc] border-b border-[#e2ddf7] shadow-xl lg:hidden h-[calc(100vh-4.5rem)] overflow-y-auto z-40 p-5">
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 p-3.5 rounded-xl font-bold font-body text-sm transition-all ${
                    isActive(link.href) ? 'bg-[#8c7ef6] text-white' : 'text-[#23213d] bg-white border border-[#e2ddf7]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-[#e2ddf7] my-4" />

              {user ? (
                <div className="p-4 bg-white rounded-2xl border border-[#e2ddf7]">
                  <p className="text-[10px] text-[#5b5876] font-mono uppercase tracking-widest mb-1">Signed in</p>
                  <p className="text-xs font-bold text-[#23213d] mb-3">{user.email}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/${storeSlug}/account/history`}
                      className="flex items-center justify-center gap-2 p-2.5 bg-[#f5f3fc] rounded-lg text-[#23213d] text-xs font-bold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Clock size={14} /> Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 p-2.5 bg-red-50 rounded-lg text-red-600 text-xs font-bold"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 p-3.5 bg-[#ff8f66] text-white rounded-xl font-bold text-sm shadow-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={16} /> Login / Sign Up
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    );
  }

  // =========================================================================
  // PERFUME STORE NAVBAR (Original luxury style)
  // =========================================================================
  return (
    <header className={`sticky top-0 z-[var(--z-sticky)] bg-[#1a0a2e]/92 backdrop-blur-xl border-b border-[rgba(201,168,76,0.25)] transition-transform duration-300 h-[72px] ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="container-custom h-full flex items-center justify-between">

        {/* 1. Logo */}
        <Link href={`/${storeSlug}`} className="flex items-center gap-3 z-20 group">
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
          <Link href={`/${storeSlug}/wishlist`} className="p-2 text-[#c4b8d4] hover:text-[#c9a84c] transition-colors">
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
                    href={`/${storeSlug}/account/history`}
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
        <div className="absolute top-[72px] left-0 w-full bg-[#1a0a2e] border-b border-[rgba(201,168,76,0.25)] shadow-2xl lg:hidden animate-slide-down h-[calc(100vh-4.5rem)] overflow-y-auto z-40">
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
                  <Link href={`/${storeSlug}/account/history`} className="flex items-center justify-center gap-2 p-3 bg-[#1a0a2e] rounded-lg text-[#c4b8d4]" onClick={() => setIsMobileMenuOpen(false)}>
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

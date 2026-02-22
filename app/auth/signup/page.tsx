'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // CHECK: Did Supabase log them in automatically?
      if (data.session) {
        // Yes -> Go to Shop
        router.push('/shop');
      } else {
        // No -> Email confirmation is required
        alert("Account created! Please check your email to verify.");
        router.push('/auth/login');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-secondary-200">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-primary-600" size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-secondary-900">Create Account</h1>
          <p className="text-secondary-500 text-sm">Join LiquorShop for faster checkout and exclusive offers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-secondary-400" size={18} />
              <input name="email" type="email" required className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary-400" size={18} />
              <input name="password" type="password" required className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none" placeholder="••••••••" minLength={6} />
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

          <Button type="submit" fullWidth size="lg" isLoading={loading}>
            Sign Up
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-secondary-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
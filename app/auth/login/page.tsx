'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { loginAction } from '../actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    
    const result = await loginAction(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-secondary-200">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-display font-bold text-secondary-900">Welcome</h1>
          <p className="text-secondary-500 text-sm mt-1">
            Sign in to access your account.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-secondary-400" size={18} />
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-secondary-700">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary-400" size={18} />
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-secondary-100 text-center space-y-4">
          <p className="text-sm text-secondary-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-bold">
              Sign Up
            </Link>
          </p>
          
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-900 transition-colors">
            Continue as Guest <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
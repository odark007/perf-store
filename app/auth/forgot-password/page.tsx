'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { forgotPasswordAction } from '../actions';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    setMessage('');
    
    const result = await forgotPasswordAction(formData);
    
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setMessage(result.success);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-secondary-200">
        
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-900 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Login
          </Link>
        </div>

        <h1 className="text-2xl font-display font-bold text-secondary-900 mb-2">Reset Password</h1>
        <p className="text-secondary-500 text-sm mb-6">Enter your email address and we'll send you a link to reset your password.</p>

        {message ? (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 mb-6">
            {message}
          </div>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-secondary-400" size={18} />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none"
                  placeholder="admin@liquorshop.gh"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
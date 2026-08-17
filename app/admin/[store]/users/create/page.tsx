'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import { createUserAction } from '@/app/auth/actions';

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');

    const result = await createUserAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      alert('User created successfully!');
      router.push('/admin/users');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users" className="p-2 hover:bg-white rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-secondary-600" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-secondary-900">Create New Admin</h1>
      </div>

      <div className="bg-white p-8 rounded-xl border border-secondary-200 shadow-sm">
        <form action={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Email Address</label>
            <input 
              name="email" type="email" required 
              className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none"
              placeholder="manager@store.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Temporary Password</label>
            <input 
              name="password" type="text" required 
              className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none"
              placeholder="StrongPassword123"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
            <select 
              name="role" 
              className="w-full p-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 outline-none"
            >
              <option value="store_manager">Store Manager (Cannot delete stock/users)</option>
              <option value="super_admin">Super Admin (Full Access)</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-secondary-100 flex justify-end">
            <Button type="submit" size="lg" isLoading={loading} leftIcon={<Save size={18} />}>
              Create User
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
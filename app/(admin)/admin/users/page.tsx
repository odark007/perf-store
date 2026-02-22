import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Shield, UserPlus, Lock } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const supabase = await createClient();

  // 1. Get Current User & Role
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <div>Unauthorized</div>;

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 2. SECURITY GATE: Block if not Super Admin
  if (currentUserProfile?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="text-red-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
        <p className="text-secondary-500 max-w-md">
          You do not have permission to view this page. Only Super Admins can manage users.
        </p>
      </div>
    );
  }

  // 3. Fetch All Users (Only runs if passed the gate above)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-8 text-red-600">Error loading users.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-secondary-900">Admin Users</h1>
        <Link href="/admin/users/create">
          <Button leftIcon={<UserPlus size={18} />}>
            New User
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-900">Email</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Role</th>
              <th className="px-6 py-4 font-semibold text-secondary-900">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {profiles?.map((profile) => (
              <tr key={profile.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 font-medium text-secondary-900">
                  {profile.email}
                </td>
                <td className="px-6 py-4">
                  {profile.role === 'super_admin' ? (
                    <Badge variant="primary" className="bg-purple-100 text-purple-700 border-purple-200">
                      <Shield size={12} className="mr-1" /> Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Store Manager</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-secondary-500">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
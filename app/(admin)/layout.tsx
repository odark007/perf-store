import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-secondary-50">
      {/* Sidebar (Fixed width) */}
      <AdminSidebar />
      
      {/* Main Content (Offset by sidebar width) */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
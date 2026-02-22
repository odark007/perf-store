import React from 'react';
import { ShoppingBag, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { getDashboardStats } from '@/app/actions/dashboard';
import { formatCurrency } from '@/lib/utils';

// Ensure fresh data on every load
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-500">Overview of your store performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary-500">Total Revenue</h3>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary-500">Pending Actions</h3>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.pendingOrders}</p>
          <p className="text-xs text-secondary-400 mt-1">Orders processing or ready</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary-500">Low Stock Alerts</h3>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.lowStockCount}</p>
          <p className="text-xs text-secondary-400 mt-1">Items below threshold</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-secondary-500">Completed Orders</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.completedOrders}</p>
        </div>

      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function SuperadminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    owners: { total: 0, active: 0, verified: 0, blocked: 0 },
    subscribers: { total: 0, active: 0, expired: 0 },
    subscriptions: { total: 0, active: 0, blocked: 0 },
    revenue: { total: 0, monthly: 0, yearly: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ownersRes, subscribersRes, subscriptionsRes] = await Promise.all([
        axiosInstance.get('/owners/bus-owners/'),
        axiosInstance.get('/superadmin/subscribers/'),
        axiosInstance.get('/superadmin/subscriptions/'),
      ]);

      const owners = ownersRes.data;
      const subscribers = subscribersRes.data;
      const subscriptions = subscriptionsRes.data;

      const ownerStats = {
        total: owners.length,
        active: owners.filter(o => o.is_active).length,
        verified: owners.filter(o => o.is_verified).length,
        blocked: owners.filter(o => !o.is_active).length,
      };

      const subscriberStats = {
        total: subscribers.length,
        active: subscribers.filter(s => s.is_active).length,
        expired: subscribers.filter(s => !s.is_active).length,
      };

      const subscriptionStats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.is_active).length,
        blocked: subscriptions.filter(s => !s.is_active).length,
      };

      const activeSubscribers = subscribers.filter(s => s.is_active);
      const totalRevenue = activeSubscribers.reduce((sum, sub) => {
        const plan = subscriptions.find(p => p.id === sub.subscription?.id);
        return sum + (plan?.price || 0);
      }, 0);

      const revenueStats = {
        total: totalRevenue,
        monthly: totalRevenue / 12,
        yearly: totalRevenue,
      };

      setStats({
        owners: ownerStats,
        subscribers: subscriberStats,
        subscriptions: subscriptionStats,
        revenue: revenueStats,
      });

    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your business performance at a glance</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Activity size={18} />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* MAIN STATS - Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Bus Owners */}
          <div 
            onClick={() => router.push('/admin/companies')}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Building2 className="text-white" size={26} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.owners.total}</h3>
            <p className="text-gray-600 text-sm mb-4">Total Bus Owners</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-600 font-semibold">{stats.owners.active} Active</span>
              <span className="text-purple-600 font-semibold">{stats.owners.verified} Verified</span>
            </div>
          </div>

          {/* Subscribers */}
          <div 
            onClick={() => router.push('/admin/subscribers')}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Users className="text-white" size={26} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.subscribers.total}</h3>
            <p className="text-gray-600 text-sm mb-4">Total Subscribers</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-600 font-semibold">{stats.subscribers.active} Active</span>
              <span className="text-red-600 font-semibold">{stats.subscribers.expired} Expired</span>
            </div>
          </div>

          {/* Plans */}
          <div 
            onClick={() => router.push('/admin/subscription')}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="text-white" size={26} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={20} />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.subscriptions.total}</h3>
            <p className="text-gray-600 text-sm mb-4">Subscription Plans</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-600 font-semibold">{stats.subscriptions.active} Active</span>
              <span className="text-gray-500 font-semibold">{stats.subscriptions.blocked} Inactive</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="text-white" size={26} />
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-4xl font-bold mb-2">₹{stats.revenue.total.toLocaleString()}</h3>
            <p className="text-blue-100 text-sm mb-4">Total Revenue</p>
            <p className="text-xs text-blue-200">
              From {stats.subscribers.active} active subscriptions
            </p>
          </div>
        </div>

        {/* KEY INSIGHTS - Spacious Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Insight 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900">Conversion Rate</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {stats.owners.total > 0 
                ? Math.round((stats.subscribers.total / stats.owners.total) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Owners becoming subscribers</p>
          </div>

          {/* Insight 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-purple-600" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900">Verification Rate</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {stats.owners.total > 0
                ? Math.round((stats.owners.verified / stats.owners.total) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-600">Verified bus owners</p>
          </div>

          {/* Insight 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900">Avg Revenue/Sub</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              ₹{stats.subscribers.active > 0 
                ? Math.round(stats.revenue.total / stats.subscribers.active).toLocaleString()
                : 0}
            </p>
            <p className="text-sm text-gray-600">Per active subscriber</p>
          </div>
        </div>

        {/* QUICK ACTIONS - Clean Buttons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/companies')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors font-medium"
            >
              <Building2 size={20} />
              Manage Owners
            </button>
            <button 
              onClick={() => router.push('/admin/subscribers')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors font-medium"
            >
              <Users size={20} />
              Subscribers
            </button>
            <button 
              onClick={() => router.push('/admin/subscription')}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors font-medium"
            >
              <Calendar size={20} />
              Plans
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors font-medium">
              <TrendingUp size={20} />
              Reports
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
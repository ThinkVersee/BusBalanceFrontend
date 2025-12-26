'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import {
  LayoutDashboard,
  Building2,
  Users,
  IndianRupee,
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
      <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-xl border border-gray-200 p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1">Monitor your business performance at a glance</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
          >
            <Activity size={14} className="sm:w-4 sm:h-4" />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* MAIN STATS - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          
          {/* Bus Owners */}
          <div 
            onClick={() => router.push('/admin/companies')}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 transition-all cursor-pointer group min-h-[140px] sm:min-h-[160px] flex flex-col"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="text-white" size={18} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={16} />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 truncate">{stats.owners.total}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-1">Total Bus Owners</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-3 text-xs mt-auto">
              <span className="text-green-600 font-medium">{stats.owners.active} Active</span>
              <span className="text-purple-600 font-medium">{stats.owners.verified} Verified</span>
            </div>
          </div>

          {/* Subscribers */}
          <div 
            onClick={() => router.push('/admin/subscribers')}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 transition-all cursor-pointer group min-h-[140px] sm:min-h-[160px] flex flex-col"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="text-white" size={18} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={16} />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 truncate">{stats.subscribers.total}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-1">Total Subscribers</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-3 text-xs mt-auto">
              <span className="text-green-600 font-medium">{stats.subscribers.active} Active</span>
              <span className="text-red-600 font-medium">{stats.subscribers.expired} Expired</span>
            </div>
          </div>

          {/* Plans */}
          <div 
            onClick={() => router.push('/admin/subscription')}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 transition-all cursor-pointer group min-h-[140px] sm:min-h-[160px] flex flex-col"
          >
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="text-white" size={18} />
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" size={16} />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 truncate">{stats.subscriptions.total}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-2 line-clamp-1">Subscription Plans</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-3 text-xs mt-auto">
              <span className="text-green-600 font-medium">{stats.subscriptions.active} Active</span>
              <span className="text-gray-500 font-medium">{stats.subscriptions.blocked} Inactive</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white min-h-[140px] sm:min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm">
                <IndianRupee className="text-white" size={18} />
              </div>
              <div className="bg-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-sm">
                <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <h3 className="font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-2xl sm:text-3xl lg:text-4xl leading-tight">
              ₹{stats.revenue.total.toLocaleString()}
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm mb-1 line-clamp-1">Total Revenue</p>
            <p className="text-xs text-blue-200 mt-auto">
              From {stats.subscribers.active} active subs
            </p>
          </div>
        </div>

        {/* KEY INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={16} />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Conversion Rate</h4>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              {stats.owners.total > 0 ? Math.round((stats.subscribers.total / stats.owners.total) * 100) : 0}%
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Owners → Subscribers</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-300 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-purple-600" size={16} />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Verification Rate</h4>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              {stats.owners.total > 0 ? Math.round((stats.owners.verified / stats.owners.total) * 100) : 0}%
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Verified owners</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-300 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="text-green-600" size={16} />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Avg Revenue/Sub</h4>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              ₹{stats.subscribers.active > 0 ? Math.round(stats.revenue.total / stats.subscribers.active).toLocaleString() : 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Per active subscriber</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-300 p-4 sm:p-6 lg:p-8">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <button 
              onClick={() => router.push('/admin/companies')}
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium"
            >
              <Building2 size={16} />
              <span>Owners</span>
            </button>
            <button 
              onClick={() => router.push('/admin/subscribers')}
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium"
            >
              <Users size={16} />
              <span>Subscribers</span>
            </button>
            <button 
              onClick={() => router.push('/admin/subscription')}
              className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium"
            >
              <Calendar size={16} />
              <span>Plans</span>
            </button>
            <button className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium">
              <TrendingUp size={16} />
              <span>Reports</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
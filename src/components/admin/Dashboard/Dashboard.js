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
  ArrowUpRight,
  BarChart3,
  Clock,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-100 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
              <Clock size={14} />
              Real-time analytics and insights
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* MAIN STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Bus Owners - Blue Theme */}
          <div 
            onClick={() => router.push('/admin/companies')}
            className="group bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 sm:p-6 cursor-pointer transition-all hover:border-blue-400 hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-sm">
                <Building2 className="text-blue-600 group-hover:text-white transition-colors" size={20} />
              </div>
              <ArrowUpRight className="text-blue-400 group-hover:text-blue-600 transition-colors" size={18} />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.owners.total}</h3>
            <p className="text-sm text-gray-700 font-semibold mb-3">Bus Owners</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white/70 text-blue-700 rounded-md font-medium shadow-sm">
                {stats.owners.active} Active
              </span>
              <span className="px-2.5 py-1 bg-white/70 text-blue-700 rounded-md font-medium shadow-sm">
                {stats.owners.verified} Verified
              </span>
            </div>
          </div>

          {/* Subscribers - Green Theme */}
          <div 
            onClick={() => router.push('/admin/subscribers')}
            className="group bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5 sm:p-6 cursor-pointer transition-all hover:border-green-400 hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors shadow-sm">
                <Users className="text-green-600 group-hover:text-white transition-colors" size={20} />
              </div>
              <ArrowUpRight className="text-green-400 group-hover:text-green-600 transition-colors" size={18} />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.subscribers.total}</h3>
            <p className="text-sm text-gray-700 font-semibold mb-3">Subscribers</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white/70 text-green-700 rounded-md font-medium shadow-sm">
                {stats.subscribers.active} Active
              </span>
              <span className="px-2.5 py-1 bg-white/70 text-green-700 rounded-md font-medium shadow-sm">
                {stats.subscribers.expired} Expired
              </span>
            </div>
          </div>

          {/* Plans - Purple Theme */}
          <div 
            onClick={() => router.push('/admin/subscription')}
            className="group bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5 sm:p-6 cursor-pointer transition-all hover:border-purple-400 hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors shadow-sm">
                <Calendar className="text-purple-600 group-hover:text-white transition-colors" size={20} />
              </div>
              <ArrowUpRight className="text-purple-400 group-hover:text-purple-600 transition-colors" size={18} />
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{stats.subscriptions.total}</h3>
            <p className="text-sm text-gray-700 font-semibold mb-3">Subscription Plans</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 bg-white/70 text-purple-700 rounded-md font-medium shadow-sm">
                {stats.subscriptions.active} Active
              </span>
              <span className="px-2.5 py-1 bg-white/70 text-purple-700 rounded-md font-medium shadow-sm">
                {stats.subscriptions.blocked} Inactive
              </span>
            </div>
          </div>

          {/* Revenue - Blue Gradient */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 sm:p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <IndianRupee size={20} />
              </div>
              <div className="px-2.5 py-1 bg-white/20 rounded-md flex items-center gap-1 backdrop-blur-sm">
                <TrendingUp size={12} />
                <span className="text-xs font-medium">Live</span>
              </div>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold mb-1">
              ₹{stats.revenue.total.toLocaleString()}
            </h3>
            <p className="text-sm text-blue-100 font-semibold mb-3">Total Revenue</p>
            <p className="text-xs text-blue-100">
              From {stats.subscribers.active} active subscribers
            </p>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          
          <div className="bg-white border-2 border-blue-100 rounded-xl p-5 sm:p-6 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-blue-600" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900">Conversion Rate</h4>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
              {stats.owners.total > 0 ? Math.round((stats.subscribers.total / stats.owners.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Owners to subscribers</p>
          </div>

          <div className="bg-white border-2 border-green-100 rounded-xl p-5 sm:p-6 hover:border-green-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900">Verification Rate</h4>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-green-600 mb-1">
              {stats.owners.total > 0 ? Math.round((stats.owners.verified / stats.owners.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Verified owners</p>
          </div>

          <div className="bg-white border-2 border-purple-100 rounded-xl p-5 sm:p-6 hover:border-purple-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={18} />
              </div>
              <h4 className="font-semibold text-gray-900">Avg Revenue</h4>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1">
              ₹{stats.subscribers.active > 0 ? Math.round(stats.revenue.total / stats.subscribers.active).toLocaleString() : 0}
            </p>
            <p className="text-sm text-gray-600">Per subscriber</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <button 
              onClick={() => router.push('/admin/companies')}
              className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-lg transition-all"
            >
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="text-blue-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Owners</span>
            </button>

            <button 
              onClick={() => router.push('/admin/subscribers')}
              className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 rounded-lg transition-all"
            >
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Users className="text-green-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Subscribers</span>
            </button>

            <button 
              onClick={() => router.push('/admin/subscription')}
              className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-300 rounded-lg transition-all"
            >
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="text-purple-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Plans</span>
            </button>

            <button className="flex flex-col items-center gap-3 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-lg transition-all">
              <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <BarChart3 className="text-blue-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-900">Reports</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
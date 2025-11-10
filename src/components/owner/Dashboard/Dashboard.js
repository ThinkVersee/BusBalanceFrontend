"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bus,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  ArrowRight,
  Activity,
} from "lucide-react";
import axiosInstance from "@/config/axiosInstance";
import Link from "next/link";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalBuses: 0,
    operationalBuses: 0,
    totalStaff: 0,
    activeStaff: 0,
    todayIncome: 0,
    todayExpense: 0,
    netProfit: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [busRes, staffRes, financeRes] = await Promise.all([
        axiosInstance.get("/buses/buses/"),
        axiosInstance.get("/employees/staff/"),
        axiosInstance.get("/finance/transactions/report/", { params: { date: today } }),
      ]);
      const buses = busRes.data || [];
      const staff = staffRes.data || [];
      const transactions = financeRes.data.transactions || [];
      const operationalBuses = buses.filter((b) => b.is_operational).length;
      const activeStaff = staff.filter((s) => s.is_active_employee).length;
      const income = transactions
        .filter((t) => t.transaction_type === "INCOME")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expense = transactions
        .filter((t) => t.transaction_type === "EXPENSE")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const netProfit = income - expense;
      // Recent 5 transactions
      const recent = transactions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setStats({
        totalBuses: buses.length,
        operationalBuses,
        totalStaff: staff.length,
        activeStaff,
        todayIncome: income,
        todayExpense: expense,
        netProfit,
      });
      setRecentTransactions(recent);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="text-blue-600 flex-shrink-0" size={28} />
            <span className="truncate">Owner Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Real-time overview of your fleet & finances</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Buses Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bus className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">Total</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 mb-1">
              {stats.totalBuses}
            </div>
            <div className="text-sm text-gray-600 mb-2">Buses</div>
            <div className="mt-2 text-xs text-green-600">
              {stats.operationalBuses} operational
            </div>
            <Link 
              href="/owner/bus" 
              className="mt-3 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Buses <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>

          {/* Staff Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">Total</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 mb-1">
              {stats.totalStaff}
            </div>
            <div className="text-sm text-gray-600 mb-2">Staff Members</div>
            <div className="mt-2 text-xs text-green-600">
              {stats.activeStaff} active
            </div>
            <Link 
              href="/owner/staff" 
              className="mt-3 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Staff <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>

          {/* Today's Income */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">Today</span>
            </div>
            <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-green-600 mb-1">
              ₹ {stats.todayIncome.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 mb-2">Income</div>
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Calendar size={12} className="inline mr-1 flex-shrink-0" />
              <span className="truncate">{new Date(today).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-white" size={20} />
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">Today</span>
            </div>
            <div className={`text-xl sm:text-2xl lg:text-2xl font-bold ${stats.netProfit >= 0 ? "text-green-600" : "text-red-600"} mb-1`}>
              ₹ {stats.netProfit.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 mb-2">Net Profit</div>
            <div className="mt-2 text-xs flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-green-600">+₹{stats.todayIncome.toFixed(0)}</span>
              <span className="text-red-600">-₹{stats.todayExpense.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions - Fully Responsive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
              Recent Transactions
            </h2>
            <Link 
              href="/owner/expense" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium self-start sm:self-auto"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 sm:py-10">
              <p className="text-sm text-gray-500">No transactions today</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto pr-1 sm:pr-0">
              {recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        t.transaction_type === "INCOME"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.transaction_type === "INCOME" ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {t.category_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {t.bus_name || "General"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <div
                      className={`text-sm sm:text-base font-semibold ${
                        t.transaction_type === "INCOME" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.transaction_type === "INCOME" ? "+" : "-"}₹ {parseFloat(t.amount).toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - Fully Responsive */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link
            href="/owner/expense"
            className="bg-blue-600 text-white p-4 sm:p-5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <DollarSign size={18} className="flex-shrink-0" />
              <span className="font-medium truncate">New Entry</span>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </Link>
          <Link
            href="/owner/bus"
            className="bg-indigo-600 text-white p-4 sm:p-5 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Bus size={18} className="flex-shrink-0" />
              <span className="font-medium truncate">Manage Buses</span>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </Link>
          <Link
            href="/owner/staff"
            className="bg-teal-600 text-white p-4 sm:p-5 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Users size={18} className="flex-shrink-0" />
              <span className="font-medium truncate">Manage Staff</span>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
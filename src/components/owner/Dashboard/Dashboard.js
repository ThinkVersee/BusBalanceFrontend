"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bus, Users, IndianRupee, TrendingUp, TrendingDown,
  Activity, Wallet, ArrowRight, Loader2, AlertCircle,
  Calendar, BarChart3, CheckCircle
} from "lucide-react";
import axiosInstance from "@/config/axiosInstance";
import Link from "next/link";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    totalBuses: 0, operationalBuses: 0,
    totalStaff: 0, activeStaff: 0,
    todayIncome: 0, todayExpense: 0, netProfit: 0,
    currentBalance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "", reason: "", method: "Cash", reference: ""
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [busRes, staffRes, financeRes, balanceRes] = await Promise.all([
        axiosInstance.get("/buses/buses/"),
        axiosInstance.get("/employees/staff/"),
        axiosInstance.get("/finance/transactions/report/", { params: { date: today } }),
        axiosInstance.get("/finance/balance/")
      ]);

      const buses = busRes.data || [];
      const staff = staffRes.data || [];
      const transactions = financeRes.data.transactions || [];
      const balance = balanceRes.data.current_balance || 0;

      const operationalBuses = buses.filter(b => b.is_operational).length;
      const activeStaff = staff.filter(s => s.is_active_employee).length;

      const income = transactions
        .filter(t => t.transaction_type === "INCOME")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expense = transactions
        .filter(t => t.transaction_type === "EXPENSE")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const netProfit = income - expense;

      const recent = transactions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 7);

      setStats({
        totalBuses: buses.length,
        operationalBuses,
        totalStaff: staff.length,
        activeStaff,
        todayIncome: income,
        todayExpense: expense,
        netProfit,
        currentBalance: parseFloat(balance)
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
  }, [fetchDashboardData]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawLoading(true);

    try {
      await axiosInstance.post("/finance/withdraw/", {
        amount: parseFloat(withdrawForm.amount),
        reason: withdrawForm.reason,
        withdrawal_method: withdrawForm.method,
        withdrawal_reference: withdrawForm.reference
      });
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: "", reason: "", method: "Cash", reference: "" });
      fetchDashboardData();
    } catch (err) {
      setWithdrawError(err.response?.data?.amount?.[0] || "Withdrawal failed.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-xl border border-gray-200">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center">
              <Activity className="  w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600">Today, {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:bg-gray-50">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Today
            </button>
            <Link href="/owner/expense" className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white text-black border border-gray-300 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 hover:bg-blue-700">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Reports
            </Link>
          </div>
        </div>

        {/* Current Balance Card */}
<div className="mb-4 sm:mb-8">
  <div className="bg-white border border-gray-300 rounded-xl sm:rounded-xl p-4 sm:p-6 text-black">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-black text-xs sm:text-sm font-medium">Current Balance</p>
        <p className="text-2xl sm:text-4xl font-bold mt-1">₹{stats.currentBalance.toLocaleString('en-IN')}</p>
      </div>
      <Wallet className="w-12 h-12 sm:w-16 sm:h-16 opacity-30 text-blue-400" />
    </div>
    <button
      onClick={() => setShowWithdrawModal(true)}
      className="mt-3 sm:mt-5 w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium text-white transition"
    >
      Withdraw Funds
    </button>
  </div>
</div>


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <Link href="/owner/bus" className="bg-blue-50 rounded-xl border border-gray-300 p-4 sm:p-6 transition">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalBuses}</span>
            </div>
            <p className="font-medium text-sm sm:text-base text-gray-900">Total Buses</p>
            <div className="mt-2 sm:mt-3 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {stats.operationalBuses} Running
              </span>
              <span className="text-gray-500">{stats.totalBuses - stats.operationalBuses} Idle</span>
            </div>
          </Link>

          <Link href="/owner/staff" className="bg-purple-50 rounded-xl border border-gray-300 p-4 sm:p-6 transition">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalStaff}</span>
            </div>
            <p className="font-medium text-sm sm:text-base text-gray-900">Total Staff</p>
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {stats.activeStaff} Active
            </div>
          </Link>

          <div className="bg-emerald-50 rounded-xl border border-gray-300 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
              <span className={`text-2xl sm:text-3xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.netProfit >= 0 ? '+' : '-'}₹{Math.abs(stats.netProfit).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="font-medium text-sm sm:text-base text-gray-900">Today's Net Profit</p>
            <div className="mt-2 sm:mt-3 flex justify-between text-xs sm:text-sm">
              <span className="text-emerald-600">+₹{stats.todayIncome.toLocaleString('en-IN')}</span>
              <span className="text-red-600">-₹{stats.todayExpense.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions + Quick Actions */}
      <div className="grid lg:grid-cols-3  gap-3 sm:gap-4">
  {/* Quick Actions */}
  <div className="bg-white rounded-xl  border border-gray-300 p-4 sm:p-5">
    <h3 className="font-semibold text-base text-gray-900 mb-3">Quick Actions</h3>
    <div className="space-y-2.5">
      {[
        { to: "/owner/expense?tab=new", label: "New Entry", icon: IndianRupee, color: "bg-emerald-500" },
        { to: "/owner/bus", label: "Manage Buses", icon: Bus, color: "bg-blue-500" },
        { to: "/owner/staff", label: "Manage Staff", icon: Users, color: "bg-purple-500" },
        { to: "/owner/expense?tab=records", label: "View Reports", icon: BarChart3, color: "bg-orange-500" },
      ].map((item, i) => (
        <Link
          key={i}
          href={item.to}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.color} text-white flex-shrink-0`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm text-gray-800">{item.label}</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  </div>

  {/* Recent Transactions */}
  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-300 p-4 sm:p-5">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h3 className="font-semibold text-base text-gray-900">Recent Transactions</h3>
      <Link href="/owner/expense?tab=records" className="text-blue-600 hover:underline text-sm font-medium">
        View all
      </Link>
    </div>

    {recentTransactions.length === 0 ? (
      <div className="text-center py-6 text-gray-400">
        <IndianRupee className="w-12 h-12 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No transactions today</p>
      </div>
    ) : (
      <div className="space-y-2">
        {recentTransactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  t.transaction_type === "INCOME"
                    ? "bg-emerald-100 text-emerald-600"
                    : t.transaction_type === "WITHDRAWAL"
                    ? "bg-purple-100 text-purple-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {t.transaction_type === "INCOME" ? (
                  <TrendingUp className="w-5 h-5" />
                ) : t.transaction_type === "WITHDRAWAL" ? (
                  <Wallet className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-gray-900 truncate">{t.category_name}</p>
                <p className="text-xs text-gray-500 truncate">{t.bus_name || "General"}</p>
              </div>
            </div>
            <span
              className={`font-semibold text-sm flex-shrink-0 ml-2 ${
                t.transaction_type === "INCOME"
                  ? "text-emerald-600"
                  : t.transaction_type === "WITHDRAWAL"
                  ? "text-purple-600"
                  : "text-red-600"
              }`}
            >
              {t.transaction_type === "INCOME" ? "+" : "-"}₹{parseFloat(t.amount).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

      </div>

      {/* WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Withdraw Funds</h3>
            <form onSubmit={handleWithdraw}>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={withdrawForm.reason}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white resize-none"
                    placeholder="Purpose of withdrawal..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={withdrawForm.method}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                  <input
                    type="text"
                    value={withdrawForm.reference}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="Transaction ID, UTR, etc."
                  />
                </div>
              </div>

              {withdrawError && (
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                  {withdrawError}
                </div>
              )}

              <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawError("");
                  }}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {withdrawLoading && <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />}
                  Withdraw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
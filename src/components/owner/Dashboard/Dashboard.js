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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Owner Dashboard</h1>
              <p className="text-gray-600">Today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-50">
              <Calendar className="w-4 h-4" /> Today
            </button>
            <Link href="/owner/expense" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
              <BarChart3 className="w-4 h-4" /> Reports
            </Link>
          </div>
        </div>

        {/* Current Balance Card */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Current Balance</p>
                <p className="text-4xl font-bold mt-1">₹{stats.currentBalance.toLocaleString('en-IN')}</p>
              </div>
              <Wallet className="w-16 h-16 opacity-30" />
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-5 w-full sm:w-auto px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-medium hover:bg-white/30 transition"
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Link href="/owner/bus" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalBuses}</span>
            </div>
            <p className="font-medium text-gray-900">Total Buses</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> {stats.operationalBuses} Running
              </span>
              <span className="text-gray-500">{stats.totalBuses - stats.operationalBuses} Idle</span>
            </div>
          </Link>

          <Link href="/owner/staff" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalStaff}</span>
            </div>
            <p className="font-medium text-gray-900">Total Staff</p>
            <div className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {stats.activeStaff} Active
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <span className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.netProfit >= 0 ? '+' : '-'}₹{Math.abs(stats.netProfit).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="font-medium text-gray-900">Today's Net Profit</p>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-emerald-600">+₹{stats.todayIncome.toLocaleString('en-IN')}</span>
              <span className="text-red-600">-₹{stats.todayExpense.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { to: "/owner/expense?tab=new", label: "New Entry", icon: IndianRupee, color: "bg-emerald-500" },
                { to: "/owner/bus", label: "Manage Buses", icon: Bus, color: "bg-blue-500" },
                { to: "/owner/staff", label: "Manage Staff", icon: Users, color: "bg-purple-500" },
                { to: "/owner/expense?tab=records", label: "View Reports", icon: BarChart3, color: "bg-orange-500" },
              ].map((item, i) => (
                <Link key={i} href={item.to} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 ${item.color} text-white rounded-lg`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-800">{item.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Recent Transactions</h3>
              <Link href="/owner/expense?tab=records" className="text-blue-600 hover:underline text-sm font-medium">
                View all
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No transactions today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-lg ${t.transaction_type === "INCOME" ? "bg-emerald-100 text-emerald-600" :
                        t.transaction_type === "WITHDRAWAL" ? "bg-purple-100 text-purple-600" :
                          "bg-red-100 text-red-600"
                        }`}>
                        {t.transaction_type === "INCOME" ? <TrendingUp className="w-5 h-5" /> :
                          t.transaction_type === "WITHDRAWAL" ? <Wallet className="w-5 h-5" /> :
                            <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{t.category_name}</p>
                        <p className="text-sm text-gray-500">{t.bus_name || "General"}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-lg ${t.transaction_type === "INCOME" ? "text-emerald-600" :
                      t.transaction_type === "WITHDRAWAL" ? "text-purple-600" :
                        "text-red-600"
                      }`}>
                      {t.transaction_type === "INCOME" ? "+" : "-"}₹{parseFloat(t.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YOUR ORIGINAL, PERFECT WITHDRAWAL MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
            <form onSubmit={handleWithdraw}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    required
                    rows={3}
                    value={withdrawForm.reason}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Purpose of withdrawal..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={withdrawForm.method}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                  <input
                    type="text"
                    value={withdrawForm.reference}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transaction ID, UTR, etc."
                  />
                </div>
              </div>

              {withdrawError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {withdrawError}
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setWithdrawError("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {withdrawLoading && <Loader2 size={16} className="animate-spin" />}
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
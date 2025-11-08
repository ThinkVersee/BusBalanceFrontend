"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Save,
  Calendar,
  Loader2,
  FileText,
  Eye,
  Filter,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
} from "lucide-react";
import axiosInstance from "@/config/axiosInstance";

export default function BillBookForm() {
  const [activeTab, setActiveTab] = useState("new");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    bus: "",
  });

  const [ownedBuses, setOwnedBuses] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterBus, setFilterBus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [busRes, catRes] = await Promise.all([
          axiosInstance.get("/finance/buses/"),
          axiosInstance.get("/finance/categories/"),
        ]);

        setOwnedBuses(busRes.data);

        const income = catRes.data
          .filter((c) => c.transaction_type === "INCOME")
          .map((c) => ({
            id: c.id,
            name: c.name,
            amount: "",
            transaction_type: "INCOME",
          }));

        const expense = catRes.data
          .filter((c) => c.transaction_type === "EXPENSE")
          .map((c) => ({
            id: c.id,
            name: c.name,
            amount: "",
            transaction_type: "EXPENSE",
          }));

        setIncomeCategories(income);
        setExpenseCategories(expense);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "records") fetchRecords();
  }, [activeTab, filterDate, filterBus]);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterBus) params.bus = filterBus;

      const res = await axiosInstance.get("/finance/transactions/report/", { params });
      setRecords(res.data.transactions || []);
    } catch (err) {
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const updateIncomeAmount = (id, value) => {
    setIncomeCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, amount: value } : cat))
    );
  };

  const updateExpenseAmount = (id, value) => {
    setExpenseCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, amount: value } : cat))
    );
  };

  const addNewCategory = async (type) => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await axiosInstance.post("/finance/categories/", {
        name: newCategoryName,
        transaction_type: type,
      });
      const newCat = {
        id: res.data.id,
        name: res.data.name,
        amount: "",
        transaction_type: type,
      };
      if (type === "INCOME") {
        setIncomeCategories((prev) => [...prev, newCat]);
        setShowAddIncome(false);
      } else {
        setExpenseCategories((prev) => [...prev, newCat]);
        setShowAddExpense(false);
      }
      setNewCategoryName("");
    } catch (err) {
      alert(err.response?.data?.name?.[0] || "Failed to add category.");
    }
  };

  const deleteCategory = async (id, type) => {
    if (!confirm("Delete this category permanently?")) return;
    try {
      await axiosInstance.delete(`/finance/categories/${id}`);
      if (type === "INCOME") {
        setIncomeCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete category");
    }
  };

  const deleteRecord = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await axiosInstance.delete(`/finance/transactions/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete record");
    }
  };

  const calculateTotal = (cats) =>
    cats.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalIncome = calculateTotal(incomeCategories);
  const totalExpense = calculateTotal(expenseCategories);
  const balance = totalIncome - totalExpense;

  const handleSave = async () => {
    const transactions = [];
    incomeCategories.forEach((cat) => {
      if (cat.amount && parseFloat(cat.amount) > 0) {
        transactions.push({
          owner_category_id: cat.id,
          amount: parseFloat(cat.amount),
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
        });
      }
    });
    expenseCategories.forEach((cat) => {
      if (cat.amount && parseFloat(cat.amount) > 0) {
        transactions.push({
          owner_category_id: cat.id,
          amount: parseFloat(cat.amount),
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
        });
      }
    });

    if (transactions.length === 0) return alert("Please enter at least one amount.");

    setSaving(true);
    try {
      await axiosInstance.post("/finance/transactions/bulk/", transactions);
      alert("Saved successfully!");
      setIncomeCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
      setExpenseCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to save.";
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const groupedRecords = Array.isArray(records)
    ? records.reduce((acc, r) => {
        if (!acc[r.date]) acc[r.date] = [];
        acc[r.date].push(r);
        return acc;
      }, {})
    : {};

  const filteredDates = Object.keys(groupedRecords)
    .filter((d) => !filterDate || d === filterDate)
    .sort((a, b) => new Date(b) - new Date(a));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Bill Book</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Transaction Register</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-14 sm:top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab("new")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "new"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileText size={18} /> 
              <span>New Entry</span>
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "records"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Eye size={18} /> 
              <span>Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Entry Tab */}
      {activeTab === "new" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-lg shadow">
            {/* Form Header */}
            <div className="px-4 sm:px-6 py-4 border-b">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bus Number
                  </label>
                  <select
                    value={formData.bus}
                    onChange={(e) => setFormData({ ...formData, bus: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Buses</option>
                    {ownedBuses.map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.bus_name} ({bus.registration_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x">
              {/* Income Section */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-600 flex-shrink-0" size={20} />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Income</h2>
                  </div>
                  <button
                    onClick={() => setShowAddIncome(true)}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} /> <span className="hidden sm:inline">Add</span>
                  </button>
                </div>

                {showAddIncome && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => {
                          setShowAddIncome(false);
                          setNewCategoryName("");
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addNewCategory("INCOME")}
                        className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {incomeCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div className="flex-1 text-sm text-gray-700 font-medium truncate">
                        {cat.name}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cat.amount}
                        onChange={(e) => updateIncomeAmount(cat.id, e.target.value)}
                        placeholder="0.00"
                        className="w-24 sm:w-32 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => deleteCategory(cat.id, "INCOME")}
                        className="p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Income</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹ {totalIncome.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Expense Section */}
              <div className="p-4 sm:p-6 border-t lg:border-t-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="text-red-600 flex-shrink-0" size={20} />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Expenses</h2>
                  </div>
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} /> <span className="hidden sm:inline">Add</span>
                  </button>
                </div>

                {showAddExpense && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => {
                          setShowAddExpense(false);
                          setNewCategoryName("");
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addNewCategory("EXPENSE")}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {expenseCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <div className="flex-1 text-sm text-gray-700 font-medium truncate">
                        {cat.name}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={cat.amount}
                        onChange={(e) => updateExpenseAmount(cat.id, e.target.value)}
                        placeholder="0.00"
                        className="w-24 sm:w-32 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => deleteCategory(cat.id, "EXPENSE")}
                        className="p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Expense</span>
                  <span className="text-lg font-bold text-red-600">
                    ₹ {totalExpense.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary & Save */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="text-sm text-gray-600">Net Balance:</span>
                  <span
                    className={`ml-3 text-xl sm:text-2xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹ {balance.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? "Saving..." : "Save Entry"}
                </button>
              </div>
              {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Records Tab */}
      {activeTab === "records" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="text-gray-600 flex-shrink-0" size={20} />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bus</label>
                <select
                  value={filterBus}
                  onChange={(e) => setFilterBus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Buses</option>
                  {ownedBuses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bus_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {(filterDate || filterBus) && (
                  <button
                    onClick={() => {
                      setFilterDate("");
                      setFilterBus("");
                    }}
                    className="w-full px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Records Table */}
          {loadingRecords ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : filteredDates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-base sm:text-lg font-medium text-gray-600">No records found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {filteredDates.map((date) => {
                const dayRecs = groupedRecords[date];
                if (dayRecs.length === 0) return null;

                const income = dayRecs
                  .filter((r) => r.transaction_type === "INCOME")
                  .reduce((s, r) => s + parseFloat(r.amount), 0);
                const expense = dayRecs
                  .filter((r) => r.transaction_type === "EXPENSE")
                  .reduce((s, r) => s + parseFloat(r.amount), 0);
                const bal = income - expense;

                return (
                  <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calendar className="text-gray-600 flex-shrink-0" size={18} />
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                            {new Date(date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </h3>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-gray-500">Net Balance</div>
                          <div
                            className={`text-lg sm:text-xl font-bold ${
                              bal >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ₹ {bal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Bus
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dayRecs.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    r.transaction_type === "INCOME"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {r.transaction_type === "INCOME" ? (
                                    <TrendingUp size={12} className="mr-1 hidden sm:inline" />
                                  ) : (
                                    <TrendingDown size={12} className="mr-1 hidden sm:inline" />
                                  )}
                                  <span className="hidden sm:inline">{r.transaction_type}</span>
                                  <span className="sm:hidden">{r.transaction_type === "INCOME" ? "IN" : "EXP"}</span>
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                                <div className="max-w-xs truncate">{r.category_name}</div>
                                <div className="text-xs text-gray-500 sm:hidden">{r.bus_name || "-"}</div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                                {r.bus_name || "-"}
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-right font-semibold">
                                <span
                                  className={
                                    r.transaction_type === "INCOME"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  ₹ {parseFloat(r.amount).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm">
                                <button
                                  onClick={() => deleteRecord(r.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2">
                          <tr>
                            <td colSpan="3" className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-700">
                              Daily Summary
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-gray-500 mb-0.5">Income</div>
                                  <div className="text-xs sm:text-sm font-bold text-green-600">
                                    ₹ {income.toFixed(2)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 mb-0.5">Expense</div>
                                  <div className="text-xs sm:text-sm font-bold text-red-600">
                                    ₹ {expense.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Calendar, X, Loader2 } from "lucide-react";
import axiosInstance from "@/config/axiosInstance";

export default function BillBookForm() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    bus: "",
  })

  const [buses, setBuses] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load buses and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [busRes, catRes] = await Promise.all([
          axiosInstance.get("/finance/buses/"),
          axiosInstance.get("/finance/categories/"),
        ]);

        setBuses(busRes.data);

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
        setError(err.response?.data?.detail || "Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const calculateTotal = (categories) => {
    return categories.reduce((sum, cat) => {
      const amount = parseFloat(cat.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const totalIncome = calculateTotal(incomeCategories);
  const totalExpense = calculateTotal(expenseCategories);
  const balance = totalIncome - totalExpense;

  const handleSave = async () => {
    const transactions = [];

    incomeCategories.forEach((cat) => {
      if (cat.amount && parseFloat(cat.amount) > 0) {
        transactions.push({
          category_id: cat.id,
          amount: parseFloat(cat.amount),
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
        });
      }
    });

    expenseCategories.forEach((cat) => {
      if (cat.amount && parseFloat(cat.amount) > 0) {
        transactions.push({
          category_id: cat.id,
          amount: parseFloat(cat.amount),
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
        });
      }
    });

    if (transactions.length === 0) {
      alert("Please enter at least one amount.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await axiosInstance.post("/finance/transactions/bulk/", transactions);
      alert("Bill book entry saved successfully!");

      // Reset amounts
      setIncomeCategories((prev) =>
        prev.map((c) => ({ ...c, amount: "" }))
      );
      setExpenseCategories((prev) =>
        prev.map((c) => ({ ...c, amount: "" }))
      );
    } catch (err) {
      const msg =
        err.response?.data?.[0]?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Failed to save.";
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Loader2 className="animate-spin text-amber-900" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg border-4 border-amber-900 p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-amber-900 mb-1">
              Daily Bill Book
            </h1>
            <p className="text-amber-700">Transaction Register</p>
          </div>

          {/* Date & Bus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b-2 border-amber-200">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                <Calendar className="inline-block mr-1 mb-1" size={16} />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">
                Bus Number
              </label>
              <select
                value={formData.bus}
                onChange={(e) =>
                  setFormData({ ...formData, bus: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">All Buses</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.bus_name} ({bus.registration_number})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Income Section */}
        <div className="bg-white shadow-lg border-x-4 border-amber-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-700">INCOME</h2>
            <button
              onClick={() => setShowAddIncome(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>

          <div className="space-y-3">
            {incomeCategories.map((category, index) => (
              <div key={category.id} className="flex gap-3 items-center">
                <div className="w-8 text-amber-900 font-bold">
                  {index + 1}.
                </div>
                <div className="flex-1 px-4 py-2 bg-green-50 rounded-lg font-medium text-gray-800">
                  {category.name}
                </div>
                <div className="w-40">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={category.amount}
                    onChange={(e) =>
                      updateIncomeAmount(category.id, e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Income Modal */}
          {showAddIncome && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                      Add Income Category
                    </h3>
                    <button
                      onClick={() => setShowAddIncome(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Ticket Sales"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddIncome(false)}
                      className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => addNewCategory("INCOME")}
                      className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t-2 border-green-300 flex justify-end items-center">
            <span className="text-lg font-bold text-amber-900 mr-4">
              Total Income:
            </span>
            <span className="text-2xl font-bold text-green-700 font-mono w-40 text-right">
              ₹ {totalIncome.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Expense Section */}
        <div className="bg-white shadow-lg border-x-4 border-amber-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-red-700">EXPENSE</h2>
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>

          <div className="space-y-3">
            {expenseCategories.map((category, index) => (
              <div key={category.id} className="flex gap-3 items-center">
                <div className="w-8 text-amber-900 font-bold">
                  {index + 1}.
                </div>
                <div className="flex-1 px-4 py-2 bg-red-50 rounded-lg font-medium text-gray-800">
                  {category.name}
                </div>
                <div className="w-40">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={category.amount}
                    onChange={(e) =>
                      updateExpenseAmount(category.id, e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Expense Modal */}
          {showAddExpense && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                      Add Expense Category
                    </h3>
                    <button
                      onClick={() => setShowAddExpense(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Fuel"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAddExpense(false)}
                      className="flex-1 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => addNewCategory("EXPENSE")}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t-2 border-red-300 flex justify-end items-center">
            <span className="text-lg font-bold text-amber-900 mr-4">
              Total Expense:
            </span>
            <span className="text-2xl font-bold text-red-700 font-mono w-40 text-right">
              ₹ {totalExpense.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-200 rounded-b-2xl shadow-lg border-4 border-amber-900 border-t-0 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-amber-900">BALANCE:</span>
            <span
              className={`text-4xl font-bold font-mono ${
                balance >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              ₹ {balance.toFixed(2)}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-900 text-white rounded-xl hover:bg-amber-800 disabled:opacity-70 transition-colors text-lg font-bold shadow-lg"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Save size={24} />
            )}
            {saving ? "Saving..." : "Save Bill Book Entry"}
          </button>
        </div>

        <div className="mt-4 text-center text-amber-800 text-sm">
          <p>Only categories with amounts will be saved as transactions</p>
        </div>
      </div>
    </div>
  );
}
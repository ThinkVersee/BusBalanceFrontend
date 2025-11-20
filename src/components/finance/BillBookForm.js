// pages/finance/billbook.js
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Loader2,
  IndianRupee,
  CalendarDays,
  BusFront,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

import axiosInstance from "@/config/axiosInstance";
import NewEntryForm from "@/components/finance/NewEntryForm";
import RecordsTab from "@/components/finance/RecordsTab";

export default function BillBookPage() {
  const [activeTab, setActiveTab] = useState("new");
  const [currentUser, setCurrentUser] = useState(null);

  // All your existing state (unchanged)
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
  const [expenseFiles, setExpenseFiles] = useState([]);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterBus, setFilterBus] = useState("");
  const [openDates, setOpenDates] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalAttachments, setModalAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.is_owner === true;

  const toggleDate = (date) => {
    setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  // Fetch current user
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (err) {
        console.error("Failed to parse user", err);
      }
    }
  }, []);

  // Fetch buses & categories
  useEffect(() => {
    if (!currentUser) return;

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
          .map((c) => ({ ...c, amount: "" }));
        const expense = catRes.data
          .filter((c) => c.transaction_type === "EXPENSE")
          .map((c) => ({ ...c, amount: "" }));

        setIncomeCategories(income);
        setExpenseCategories(expense);
      } catch (err) {
        setError("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Fetch records when on Records tab
  useEffect(() => {
    if (activeTab === "records" && currentUser) {
      const fetchRecords = async () => {
        setLoadingRecords(true);
        try {
          const params = {};
          if (filterDate) params.date = filterDate;
          if (filterBus) params.bus = filterBus;

          const res = await axiosInstance.get("/finance/transactions/report/", { params });
          setRecords(res.data.transactions || []);
        } catch (err) {
          console.error("Failed to fetch records", err);
          setRecords([]);
        } finally {
          setLoadingRecords(false);
        }
      };

      fetchRecords();
      setOpenDates({});
    }
  }, [activeTab, filterDate, filterBus, currentUser]);

  // Calculations
  const totalIncome = incomeCategories.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const totalExpense = expenseCategories.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const balance = totalIncome - totalExpense;

  const grandIncome = records
    .filter((r) => r.transaction_type === "INCOME")
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const grandExpense = records
    .filter((r) => r.transaction_type === "EXPENSE")
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const grandBalance = grandIncome - grandExpense;

  const isFormValid = formData.date && formData.bus;

  // Handlers (unchanged - keep your existing logic)
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
  if (!newCategoryName.trim()) return toast.error("Category name is required");

  try {
    const res = await axiosInstance.post("/finance/categories/", {
      name: newCategoryName.trim(),
      transaction_type: type,
    });

    const newCat = {
      id: res.data.id,
      name: res.data.name,
      amount: "",
      transaction_type: type,
    };

    if (type === "INCOME") {
      setIncomeCategories(prev => [...prev, newCat]);
      setShowAddIncome(false);
    } else {
      setExpenseCategories(prev => [...prev, newCat]);
      setShowAddExpense(false);
    }

    setNewCategoryName("");
    alert("Category added!");
  } catch (err) {
    const msg = err.response?.data?.name?.[0] || "Failed to add category";
    alert(msg);
  }
};


 const deleteCategory = async (id, type) => {
  if (!isOwner) return alert("Only owners can delete categories.");
  if (!confirm("Delete this category permanently? All related transactions will be affected.")) return;

  try {
    // This will throw ONLY on network error or non-2xx response
    const response = await axiosInstance.delete(`/finance/categories/${id}/`);

    // Success: 204 No Content is normal for DELETE
    if (response.status === 204 || response.status === 200 || response.status === 202) {
      // Remove from UI
      if (type === "INCOME") {
        setIncomeCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
      }

      // Optional: show success toast (better UX)
      alert("Category deleted successfully!"); // or use toast library
      return;
    }
  } catch (err) {
    // Only now do we know it actually failed
    const message =
      err.response?.data?.detail ||
      err.response?.data?.name?.[0] ||
      err.message ||
      "Failed to delete category";

    console.error("Delete category error:", err.response || err);
    alert(message);
  }
};

  const deleteRecord = async (id) => {
    if (!isOwner) return alert("Only owners can delete records.");
    if (!confirm("Delete this transaction?")) return;
    try {
      await axiosInstance.delete(`/finance/transactions/${id}/`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete record");
    }
  };

  const handleSave = async () => {
    const transactions = [];
    let hasExpense = false;

    incomeCategories.forEach((cat) => {
      const amount = parseFloat(cat.amount);
      if (cat.amount && amount > 0 && !isNaN(amount)) {
        transactions.push({
          owner_category_id: cat.id,
          amount: amount,
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
          transaction_type: "INCOME",
        });
      }
    });

    expenseCategories.forEach((cat) => {
      const amount = parseFloat(cat.amount);
      if (cat.amount && amount > 0 && !isNaN(amount)) {
        transactions.push({
          owner_category_id: cat.id,
          amount: amount,
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
          transaction_type: "EXPENSE",
        });
        hasExpense = true;
      }
    });

    if (transactions.length === 0) return alert("Please enter at least one valid amount.");

    const formDataToSend = new FormData();
    formDataToSend.append("transactions", JSON.stringify(transactions));

    if (hasExpense) {
      expenseFiles.forEach((file, i) => {
        formDataToSend.append(`expense_file_${i}`, file);
      });
    }

    setSaving(true);
    try {
      await axiosInstance.post("/finance/transactions/bulk/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Saved successfully!");

      // FULL CLEAR AFTER SUCCESS
      setIncomeCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
      setExpenseCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
      setExpenseFiles([]); // Clear files
      setFormData({
        date: new Date().toISOString().split("T")[0],
        bus: "",
      });
      setError(null);
      await refreshCategories();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details || "Failed to save.";
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  // Loading Screen
  if (!currentUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={64} />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Bill Book...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24 sm:pb-8">

        {/* Glassmorphic Header */}
        <header className=" z-50 backdrop-blur-2xl bg-white/70 border-b border-white/30  ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <IndianRupee className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
               Bill Book
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                Manage daily income and expenses
              </p>
            </div>
          </div>
        </div>

              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                  <CalendarDays size={18} className="text-blue-700" />
                  <span className="text-sm font-semibold text-blue-900">
                    {new Date().toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {formData.bus && ownedBuses.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                    <BusFront size={18} className="text-emerald-700" />
                    <span className="text-sm font-semibold text-emerald-900">
                      {ownedBuses.find(b => b.id === parseInt(formData.bus))?.registration_number || "Bus"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Floating Tab Bar - Bottom on Mobile, Top on Desktop */}
     <div className="fixed bottom-0 left-0 right-0 z-50 sm:sticky sm:top-20 sm:bottom-auto backdrop-blur-2xl bg-white/90 border-t border-gray-200/50 sm:border-t-0 sm:border-b shadow-2xl sm:shadow-none">
  <div className="max-w-7xl mx-auto">
    <div className="flex">
      {[
        { key: "new", icon: FileText, label: "New Entry" },
        { key: "records", icon: Eye, label: "View Records" },
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-1 py-4 transition-all duration-300 sm:flex-row sm:justify-center sm:gap-3
              ${isActive ? "border-b-2 border-blue-500" : "border-b-2 border-transparent"}`}
          >
            {/* ICON — same color always */}
            <Icon size={24} className="text-gray-800" />

            {/* TEXT — same color always */}
            <span className="text-xs font-semibold sm:text-sm text-gray-800">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
</div>


        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "new" && (
            <NewEntryForm
              formData={formData}
              setFormData={setFormData}
              ownedBuses={ownedBuses}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              updateIncomeAmount={updateIncomeAmount}
              updateExpenseAmount={updateExpenseAmount}
              showAddIncome={showAddIncome}
              setShowAddIncome={setShowAddIncome}
              showAddExpense={showAddExpense}
              setShowAddExpense={setShowAddExpense}
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              addNewCategory={addNewCategory}
              deleteCategory={deleteCategory}
              expenseFiles={expenseFiles}
              setExpenseFiles={setExpenseFiles}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={balance}
              handleSave={handleSave}
              saving={saving}
              error={error}
              isOwner={isOwner}
              isFormValid={isFormValid}
            />
          )}

          {activeTab === "records" && (
            <RecordsTab
              ownedBuses={ownedBuses}
              records={records}
              loadingRecords={loadingRecords}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              filterBus={filterBus}
              setFilterBus={setFilterBus}
              grandIncome={grandIncome}
              grandExpense={grandExpense}
              grandBalance={grandBalance}
              openDates={openDates}
              toggleDate={toggleDate}
              deleteRecord={deleteRecord}
              isOwner={isOwner}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              modalTitle={modalTitle}
              setModalTitle={setModalTitle}
              modalAttachments={modalAttachments}
              setModalAttachments={setModalAttachments}
            />
          )}
        </main>
      </div>
    </>
  );
}
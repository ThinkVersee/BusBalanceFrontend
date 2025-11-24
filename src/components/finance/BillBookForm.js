"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Eye,
  Loader2,
  IndianRupee,
  CalendarDays,
  BusFront,
  AlertCircle,
} from "lucide-react";

import axiosInstance from "@/config/axiosInstance";
import NewEntryForm from "@/components/finance/NewEntryForm";
import RecordsTab from "@/components/finance/RecordsTab";

export default function BillBookPage() {
  const [activeTab, setActiveTab] = useState("new");
  const [currentUser, setCurrentUser] = useState(null);

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
  const [loading, setLoading] = useState(true);

  // Real-time duplicate warnings
  const [duplicateWarnings, setDuplicateWarnings] = useState({});

  const isOwner = currentUser?.is_owner === true;

  const toggleDate = (date) => {
    setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  // Load user
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

  // Load buses + categories
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

        const sorted = [...catRes.data].sort((a, b) => a.id - b.id);

        setIncomeCategories(
          sorted
            .filter((c) => c.transaction_type === "INCOME")
            .map((c) => ({ ...c, amount: "" }))
        );

        setExpenseCategories(
          sorted
            .filter((c) => c.transaction_type === "EXPENSE")
            .map((c) => ({ ...c, amount: "" }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Load records only when on Records tab
  useEffect(() => {
    if (activeTab !== "records" || !currentUser) return;

    const fetchRecords = async () => {
      setLoadingRecords(true);
      try {
        const params = {};
        if (filterDate) params.date = filterDate;
        if (filterBus) params.bus = filterBus;
        if (!isOwner && !filterDate) {
          params.date = new Date().toISOString().split("T")[0];
        }

        const res = await axiosInstance.get("/finance/transactions/report/", { params });
        setRecords(res.data.transactions || []);
      } catch (err) {
        console.error(err);
        setRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    };

    fetchRecords();
    setOpenDates({});
  }, [activeTab, filterDate, filterBus, currentUser, isOwner]);

  // SAFE DUPLICATE CHECK – Prevents crash when owner_category is null
  const checkForDuplicate = (categoryId, date, busId) => {
    if (!date || !busId || !records.length) return false;

    return records.some((r) => {
      return (
        r.owner_category?.id === categoryId &&   // ← SAFE ACCESS
        r.date === date &&
        String(r.bus?.id || "") === String(busId)
      );
    });
  };

  // Update handlers with safe duplicate check
  const updateIncomeAmount = (id, value) => {
    const key = `${id}-${formData.date}-${formData.bus}`;

    if (value && formData.date && formData.bus) {
      if (checkForDuplicate(id, formData.date, formData.bus)) {
        setDuplicateWarnings((prev) => ({ ...prev, [key]: true }));
      } else {
        setDuplicateWarnings((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      }
    } else {
      setDuplicateWarnings((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }

    setIncomeCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, amount: value } : cat))
    );
  };

  const updateExpenseAmount = (id, value) => {
    const key = `${id}-${formData.date}-${formData.bus}`;

    if (value && formData.date && formData.bus) {
      if (checkForDuplicate(id, formData.date, formData.bus)) {
        setDuplicateWarnings((prev) => ({ ...prev, [key]: true }));
      } else {
        setDuplicateWarnings((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      }
    } else {
      setDuplicateWarnings((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }

    setExpenseCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, amount: value } : cat))
    );
  };

  // Calculations
  const totalIncome = incomeCategories.reduce((sum, c) => sum + (parseFloat(c.amount || "") || 0), 0);
  const totalExpense = expenseCategories.reduce((sum, c) => sum + (parseFloat(c.amount || "") || 0), 0);
  const balance = totalIncome - totalExpense;

  const grandIncome = records
    .filter((r) => r.transaction_type === "INCOME")
    .reduce((sum, r) => sum + (parseFloat(r.amount || 0) || 0), 0);
  const grandExpense = records
    .filter((r) => r.transaction_type === "EXPENSE")
    .reduce((sum, r) => sum + (parseFloat(r.amount || 0) || 0), 0);
  const grandBalance = grandIncome - grandExpense;

  // Category CRUD
  const addNewCategory = async (type) => {
    if (!newCategoryName.trim()) return alert("Category name required");

    try {
      const res = await axiosInstance.post("/finance/categories/", {
        name: newCategoryName.trim(),
        transaction_type: type,
      });

      const newCat = { ...res.data, amount: "" };
      if (type === "INCOME") {
        setIncomeCategories((prev) => [...prev, newCat]);
        setShowAddIncome(false);
      } else {
        setExpenseCategories((prev) => [...prev, newCat]);
        setShowAddExpense(false);
      }
      setNewCategoryName("");
      alert("Category added!");
    } catch (err) {
      alert(err.response?.data?.name?.[0] || "Failed to add category");
    }
  };

  const deleteCategory = async (id, type) => {
    if (!isOwner) return alert("Only owners can delete categories.");
    if (!confirm("Delete permanently?")) return;

    try {
      await axiosInstance.delete(`/finance/categories/${id}/`);
      if (type === "INCOME") {
        setIncomeCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setExpenseCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete");
    }
  };

  const deleteRecord = async (id) => {
    if (!isOwner) return alert("Only owners can delete records.");
    if (!confirm("Delete this transaction?")) return;
    try {
      await axiosInstance.delete(`/finance/transactions/${id}/`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete");
    }
  };

  // SAVE WITH BACKEND DUPLICATE WARNING
const handleSave = async () => {
  if (!formData.date || !formData.bus) {
    alert("Please select date and bus");
    return;
  }

  const busId = Number(formData.bus);
  if (isNaN(busId)) {
    alert("Invalid bus selected");
    return;
  }

  const transactions = [];
  let hasExpense = false;

  incomeCategories.forEach((cat) => {
    const amount = Number(cat.amount || 0);
    if (amount > 0) {
      transactions.push({
        owner_category_id: cat.id,
        amount,
        date: formData.date,
        bus_id: busId,
        transaction_type: "INCOME",
      });
    }
  });

  expenseCategories.forEach((cat) => {
    const amount = Number(cat.amount || 0);
    if (amount > 0) {
      transactions.push({
        owner_category_id: cat.id,
        amount,
        date: formData.date,
        bus_id: busId,
        transaction_type: "EXPENSE",
      });
      hasExpense = true;
    }
  });

  if (transactions.length === 0) {
    alert("Please enter at least one amount");
    return;
  }

  try {
    // 1️⃣ DUPLICATE CHECK
    const checkRes = await axiosInstance.post(
      "/finance/transactions/bulk/?check_only=1",
      { transactions }
    );

    if (checkRes.data.warning) {
      const confirmed = confirm(checkRes.data.warning);
      if (!confirmed) {
        alert("Cancelled — not saved.");
        return;
      }
    }

    // 2️⃣ ACTUAL SAVE (WITH FORM DATA)
    const form = new FormData();
    form.append("transactions", JSON.stringify(transactions));

    if (hasExpense && expenseFiles.length > 0) {
      expenseFiles.forEach((file, i) => {
        form.append(`expense_file_${i}`, file);
      });
    }

    setSaving(true);

    const saveRes = await axiosInstance.post(
      "/finance/transactions/bulk/",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert(saveRes.data.message || "Saved!");

    // RESET FIELDS
    setIncomeCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
    setExpenseCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
    setExpenseFiles([]);
    setDuplicateWarnings({});

  } catch (err) {
    console.log(err);
    alert(err.response?.data?.error || "Save failed");
  } finally {
    setSaving(false);
  }
};


  // Loading UI
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
        {/* Header */}
        <header className="z-50 backdrop-blur-2xl bg-white/70 border-b border-white/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <IndianRupee className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bill Book</h1>
                  <p className="text-gray-600 text-sm">Manage daily income & expenses</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:sticky sm:top-20 bg-white/90 backdrop-blur border-t sm:border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex">
            {[
              { key: "new", icon: FileText, label: "New Entry" },
              { key: "records", icon: Eye, label: "View Records" },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-4 sm:flex-row sm:justify-center sm:gap-3 transition-colors ${
                    active ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700"
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium sm:text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
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
              isOwner={isOwner}
              duplicateWarnings={duplicateWarnings}
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
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
            />
          )}
        </main>
      </div>
    </>
  );
}
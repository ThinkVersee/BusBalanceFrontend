"use client";

import React, { useState, useEffect } from "react";
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
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  FolderOpen, // NEW ICON
} from "lucide-react";
import axiosInstance from "@/config/axiosInstance";

// === File Input Section with Multiple Files & Remove Button ===
function FileInputSection(props) {
  const { type, files, setFiles, error } = props;

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]); // Append files
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return React.createElement(
    "div",
    { className: "mt-4 p-4 border rounded-lg bg-gray-50" },
    React.createElement(
      "div",
      { className: "flex items-center gap-2 mb-2" },
      React.createElement(Upload, { size: 18, className: "text-blue-600" }),
      React.createElement(
        "h4",
        { className: "font-medium text-sm" },
        type === "INCOME" ? "Income Attachments" : "Expense Attachments"
      )
    ),
    React.createElement("input", {
      type: "file",
      multiple: true,
      accept: "image/*,application/pdf",
      onChange: handleFileChange,
      className:
        "block w-full text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100",
    }),
    files.length > 0 &&
      React.createElement(
        "div",
        { className: "mt-3 space-y-2 max-h-48 overflow-y-auto" },
        files.map((file, index) =>
          React.createElement(
            "div",
            {
              key: index,
              className:
                "flex items-center justify-between p-2 bg-white rounded border text-xs",
            },
            React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-1 text-green-600 truncate max-w-[200px] sm:max-w-xs",
              },
              React.createElement(CheckCircle, { size: 14 }),
              React.createElement("span", { className: "truncate" }, file.name)
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => removeFile(index),
                className: "text-red-500 hover:text-red-700",
              },
              React.createElement(X, { size: 14 })
            )
          )
        )
      ),
    error &&
      React.createElement(
        "div",
        { className: "mt-2 flex items-center gap-1 text-red-600 text-xs" },
        React.createElement(AlertCircle, { size: 14 }),
        error
      )
  );
}

// === Attachment Display in Records ===
function AttachmentItem(props) {
  const { attachment } = props;
  const isImage = attachment.file_name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = attachment.file_name.match(/\.pdf$/i);

  return React.createElement(
    "div",
    { className: "flex items-center gap-2 p-2 bg-white rounded border" },
    isImage
      ? React.createElement(
          "a",
          {
            href: attachment.file_url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "block",
          },
          React.createElement("img", {
            src: attachment.file_url,
            alt: attachment.file_name,
            className: "w-16 h-16 object-cover rounded border",
          })
        )
      : isPDF
      ? React.createElement(
          "a",
          {
            href: attachment.file_url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-2 text-blue-600 hover:underline",
          },
          React.createElement(FileText, { size: 16 }),
          React.createElement("span", { className: "text-xs" }, attachment.file_name),
          React.createElement(ExternalLink, { size: 14 })
        )
      : React.createElement(
          "a",
          {
            href: attachment.file_url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-2 text-gray-600 hover:underline",
          },
          React.createElement(FileText, { size: 16 }),
          React.createElement("span", { className: "text-xs" }, attachment.file_name)
        )
  );
}

// === NEW: Modal to View All Income/Expense Attachments for a Day ===
function AttachmentsModal({ isOpen, onClose, title, attachments }) {
  if (!isOpen) return null;

  return React.createElement(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",
      onClick: onClose,
    },
    React.createElement(
      "div",
      {
        className: "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col",
        onClick: (e) => e.stopPropagation(),
      },
      // Header
      React.createElement(
        "div",
        { className: "flex items-center justify-between p-4 border-b" },
        React.createElement(
          "h3",
          { className: "text-lg font-semibold text-gray-900" },
          title
        ),
        React.createElement(
          "button",
          {
            onClick: onClose,
            className: "p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100",
          },
          React.createElement(X, { size: 20 })
        )
      ),
      // Body
      React.createElement(
        "div",
        { className: "flex-1 overflow-y-auto p-4 space-y-3" },
        attachments.length === 0
          ? React.createElement(
              "p",
              { className: "text-center text-gray-500 py-8" },
              "No attachments found"
            )
          : attachments.map((att) =>
              React.createElement(AttachmentItem, { key: att.id, attachment: att })
            )
      )
    )
  );
}

// === Main Component ===
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

  // Multiple files
  const [incomeFiles, setIncomeFiles] = useState([]);
  const [expenseFiles, setExpenseFiles] = useState([]);

  // NEW: Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalAttachments, setModalAttachments] = useState([]);

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
          .map((c) => ({ id: c.id, name: c.name, amount: "", transaction_type: "INCOME" }));
        const expense = catRes.data
          .filter((c) => c.transaction_type === "EXPENSE")
          .map((c) => ({ id: c.id, name: c.name, amount: "", transaction_type: "EXPENSE" }));
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
    let hasIncome = false, hasExpense = false;

    incomeCategories.forEach((cat) => {
      if (cat.amount && parseFloat(cat.amount) > 0) {
        transactions.push({
          owner_category_id: cat.id,
          amount: parseFloat(cat.amount),
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
          transaction_type: "INCOME",
        });
        hasIncome = true;
      }
    });

    expenseCategories.forEach((cat) => {
      if (cat.amount && parseFloat(cat.amount) > 0) {
        transactions.push({
          owner_category_id: cat.id,
          amount: parseFloat(cat.amount),
          date: formData.date,
          bus_id: formData.bus ? parseInt(formData.bus) : null,
          transaction_type: "EXPENSE",
        });
        hasExpense = true;
      }
    });

    if (transactions.length === 0) return alert("Please enter at least one amount.");

    const formDataToSend = new FormData();
    formDataToSend.append("transactions", JSON.stringify(transactions));

    incomeFiles.forEach((file, index) => {
      if (hasIncome) formDataToSend.append(`income_file_${index}`, file);
    });

    expenseFiles.forEach((file, index) => {
      if (hasExpense) formDataToSend.append(`expense_file_${index}`, file);
    });

    setSaving(true);
    try {
      await axiosInstance.post("/finance/transactions/bulk/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Saved successfully!");
      setIncomeCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
      setExpenseCategories((prev) => prev.map((c) => ({ ...c, amount: "" })));
      setIncomeFiles([]);
      setExpenseFiles([]);
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
    return React.createElement(
      "div",
      { className: "min-h-screen flex items-center justify-center bg-gray-50" },
      React.createElement(Loader2, { className: "animate-spin text-blue-600", size: 48 })
    );
  }

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-50" },

    // Header
    React.createElement(
      "div",
      { className: "bg-white border-b shadow-sm sticky top-0 z-10" },
      React.createElement(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between h-14 sm:h-16" },
          React.createElement(
            "div",
            { className: "flex items-center gap-2 sm:gap-3" },
            React.createElement(
              "div",
              {
                className:
                  "w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0",
              },
              React.createElement(DollarSign, { className: "text-white", size: 20 })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("h1", { className: "text-base sm:text-xl font-bold text-gray-900" }, "Bill Book"),
              React.createElement("p", { className: "text-xs text-gray-500 hidden sm:block" }, "Transaction Register")
            )
          )
        )
      )
    ),

    // Tabs
    React.createElement(
      "div",
      { className: "bg-white border-b sticky top-14 sm:top-16 z-10" },
      React.createElement(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
        React.createElement(
          "div",
          { className: "flex" },
          React.createElement(
            "button",
            {
              onClick: () => setActiveTab("new"),
              className: `flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "new"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`,
            },
            React.createElement(FileText, { size: 18 }),
            React.createElement("span", null, "New Entry")
          ),
          React.createElement(
            "button",
            {
              onClick: () => setActiveTab("records"),
              className: `flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "records"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`,
            },
            React.createElement(Eye, { size: 18 }),
            React.createElement("span", null, "Records")
          )
        )
      )
    ),

    // New Entry Tab
    activeTab === "new" &&
      React.createElement(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" },
        React.createElement(
          "div",
          { className: "bg-white rounded-lg shadow" },
          // Form Header
          React.createElement(
            "div",
            { className: "px-4 sm:px-6 py-4 border-b" },
            React.createElement(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
              React.createElement(
                "div",
                null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Transaction Date"),
                React.createElement("input", {
                  type: "date",
                  value: formData.date,
                  onChange: (e) => setFormData({ ...formData, date: e.target.value }),
                  className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                })
              ),
              React.createElement(
                "div",
                null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Bus Number"),
                React.createElement(
                  "select",
                  {
                    value: formData.bus,
                    onChange: (e) => setFormData({ ...formData, bus: e.target.value }),
                    className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  },
                  React.createElement("option", { value: "" }, "All Buses"),
                  ownedBuses.map((bus) =>
                    React.createElement(
                      "option",
                      { key: bus.id, value: bus.id },
                      `${bus.bus_name} (${bus.registration_number})`
                    )
                  )
                )
              )
            )
          ),

          React.createElement(
            "div",
            { className: "grid grid-cols-1 lg:grid-cols-2 lg:divide-x" },
            // Income Section
            React.createElement(
              "div",
              { className: "p-4 sm:p-6" },
              React.createElement(
                "div",
                { className: "flex items-center justify-between mb-4" },
                React.createElement(
                  "div",
                  { className: "flex items-center gap-2" },
                  React.createElement(TrendingUp, { className: "text-green-600", size: 20 }),
                  React.createElement("h2", { className: "text-base sm:text-lg font-semibold text-gray-900" }, "Income")
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setShowAddIncome(true),
                    className: "flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100",
                  },
                  React.createElement(Plus, { size: 16 }),
                  React.createElement("span", { className: "hidden sm:inline" }, "Add")
                )
              ),

              showAddIncome &&
                React.createElement(
                  "div",
                  { className: "mb-4 p-3 bg-gray-50 rounded-md" },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2 mb-2" },
                    React.createElement("input", {
                      type: "text",
                      value: newCategoryName,
                      onChange: (e) => setNewCategoryName(e.target.value),
                      placeholder: "Category name",
                      className: "flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md",
                    }),
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setShowAddIncome(false);
                          setNewCategoryName("");
                        },
                        className: "p-2 text-gray-500 hover:text-gray-700",
                      },
                      React.createElement(X, { size: 18 })
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "flex gap-2" },
                    React.createElement(
                      "button",
                      {
                        onClick: () => addNewCategory("INCOME"),
                        className: "flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700",
                      },
                      "Add Category"
                    )
                  )
                ),

              React.createElement(
                "div",
                { className: "space-y-2 mb-4" },
                incomeCategories.map((cat) =>
                  React.createElement(
                    "div",
                    { key: cat.id, className: "flex items-center gap-2" },
                    React.createElement("div", { className: "flex-1 text-sm text-gray-700 font-medium truncate" }, cat.name),
                    React.createElement("input", {
                      type: "number",
                      step: "0.01",
                      min: "0",
                      value: cat.amount,
                      onChange: (e) => updateIncomeAmount(cat.id, e.target.value),
                      placeholder: "0.00",
                      className: "w-24 sm:w-32 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-green-500",
                    }),
                    React.createElement(
                      "button",
                      {
                        onClick: () => deleteCategory(cat.id, "INCOME"),
                        className: "p-1 text-gray-400 hover:text-red-600",
                      },
                      React.createElement(Trash2, { size: 16 })
                    )
                  )
                )
              ),

              React.createElement(FileInputSection, {
                type: "INCOME",
                files: incomeFiles,
                setFiles: setIncomeFiles,
              }),

              React.createElement(
                "div",
                { className: "pt-4 border-t flex justify-between items-center" },
                React.createElement("span", { className: "text-sm font-medium text-gray-700" }, "Total Income"),
                React.createElement(
                  "span",
                  { className: "text-lg font-bold text-green-600" },
                  `₹ ${totalIncome.toFixed(2)}`
                )
              )
            ),

            // Expense Section
            React.createElement(
              "div",
              { className: "p-4 sm:p-6 border-t lg:border-t-0" },
              React.createElement(
                "div",
                { className: "flex items-center justify-between mb-4" },
                React.createElement(
                  "div",
                  { className: "flex items-center gap-2" },
                  React.createElement(TrendingDown, { className: "text-red-600", size: 20 }),
                  React.createElement("h2", { className: "text-base sm:text-lg font-semibold text-gray-900" }, "Expenses")
                ),
                React.createElement(
                  "button",
                  {
                    onClick: () => setShowAddExpense(true),
                    className: "flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100",
                  },
                  React.createElement(Plus, { size: 16 }),
                  React.createElement("span", { className: "hidden sm:inline" }, "Add")
                )
              ),

              showAddExpense &&
                React.createElement(
                  "div",
                  { className: "mb-4 p-3 bg-gray-50 rounded-md" },
                  React.createElement(
                    "div",
                    { className: "flex items-center gap-2 mb-2" },
                    React.createElement("input", {
                      type: "text",
                      value: newCategoryName,
                      onChange: (e) => setNewCategoryName(e.target.value),
                      placeholder: "Category name",
                      className: "flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md",
                    }),
                    React.createElement(
                      "button",
                      {
                        onClick: () => {
                          setShowAddExpense(false);
                          setNewCategoryName("");
                        },
                        className: "p-2 text-gray-500 hover:text-gray-700",
                      },
                      React.createElement(X, { size: 18 })
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "flex gap-2" },
                    React.createElement(
                      "button",
                      {
                        onClick: () => addNewCategory("EXPENSE"),
                        className: "flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700",
                      },
                      "Add Category"
                    )
                  )
                ),

              React.createElement(
                "div",
                { className: "space-y-2 mb-4" },
                expenseCategories.map((cat) =>
                  React.createElement(
                    "div",
                    { key: cat.id, className: "flex items-center gap-2" },
                    React.createElement("div", { className: "flex-1 text-sm text-gray-700 font-medium truncate" }, cat.name),
                    React.createElement("input", {
                      type: "number",
                      step: "0.01",
                      min: "0",
                      value: cat.amount,
                      onChange: (e) => updateExpenseAmount(cat.id, e.target.value),
                      placeholder: "0.00",
                      className: "w-24 sm:w-32 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-red-500",
                    }),
                    React.createElement(
                      "button",
                      {
                        onClick: () => deleteCategory(cat.id, "EXPENSE"),
                        className: "p-1 text-gray-400 hover:text-red-600",
                      },
                      React.createElement(Trash2, { size: 16 })
                    )
                  )
                )
              ),

              React.createElement(FileInputSection, {
                type: "EXPENSE",
                files: expenseFiles,
                setFiles: setExpenseFiles,
              }),

              React.createElement(
                "div",
                { className: "pt-4 border-t flex justify-between items-center" },
                React.createElement("span", { className: "text-sm font-medium text-gray-700" }, "Total Expense"),
                React.createElement(
                  "span",
                  { className: "text-lg font-bold text-red-600" },
                  `₹ ${totalExpense.toFixed(2)}`
                )
              )
            )
          ),

          // Summary & Save
          React.createElement(
            "div",
            { className: "px-4 sm:px-6 py-4 bg-gray-50 border-t" },
            React.createElement(
              "div",
              { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" },
              React.createElement(
                "div",
                { className: "flex items-center justify-between sm:justify-start" },
                React.createElement("span", { className: "text-sm text-gray-600" }, "Net Balance:"),
                React.createElement(
                  "span",
                  {
                    className: `ml-3 text-xl sm:text-2xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`,
                  },
                  `₹ ${balance.toFixed(2)}`
                )
              ),
              React.createElement(
                "button",
                {
                  onClick: handleSave,
                  disabled: saving,
                  className:
                    "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50",
                },
                saving
                  ? React.createElement(Loader2, { className: "animate-spin", size: 18 })
                  : React.createElement(Save, { size: 18 }),
                saving ? "Saving..." : "Save Entry"
              )
            ),
            error &&
              React.createElement(
                "div",
                { className: "mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-md" },
                error
              )
          )
        )
      ),

    // Records Tab
    activeTab === "records" &&
      React.createElement(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" },
        // Filters
        React.createElement(
          "div",
          { className: "bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6" },
          React.createElement(
            "div",
            { className: "flex items-center gap-2 mb-4" },
            React.createElement(Filter, { className: "text-gray-600", size: 20 }),
            React.createElement("h2", { className: "text-base sm:text-lg font-semibold text-gray-900" }, "Filters")
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Date"),
              React.createElement("input", {
                type: "date",
                value: filterDate,
                onChange: (e) => setFilterDate(e.target.value),
                className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
              })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Bus"),
              React.createElement(
                "select",
                {
                  value: filterBus,
                  onChange: (e) => setFilterBus(e.target.value),
                  className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500",
                },
                React.createElement("option", { value: "" }, "All Buses"),
                ownedBuses.map((b) =>
                  React.createElement("option", { key: b.id, value: b.id }, b.bus_name)
                )
              )
            ),
            (filterDate || filterBus) &&
              React.createElement(
                "div",
                { className: "flex items-end" },
                React.createElement(
                  "button",
                  {
                    onClick: () => {
                      setFilterDate("");
                      setFilterBus("");
                    },
                    className: "w-full px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300",
                  },
                  "Clear Filters"
                )
              )
          )
        ),

        // Records Table
        loadingRecords
          ? React.createElement(
              "div",
              { className: "flex justify-center py-12" },
              React.createElement(Loader2, { className: "animate-spin text-blue-600", size: 48 })
            )
          : filteredDates.length === 0
          ? React.createElement(
              "div",
              { className: "bg-white rounded-lg shadow p-8 sm:p-12 text-center" },
              React.createElement(FileText, { className: "mx-auto text-gray-300 mb-4", size: 48 }),
              React.createElement("p", { className: "text-base sm:text-lg font-medium text-gray-600" }, "No records found"),
              React.createElement("p", { className: "text-sm text-gray-500 mt-1" }, "Try adjusting your filters")
            )
          : React.createElement(
              "div",
              { className: "space-y-6" },
              filteredDates.map((date) => {
                const dayRecs = groupedRecords[date];
                const income = dayRecs
                  .filter((r) => r.transaction_type === "INCOME")
                  .reduce((s, r) => s + parseFloat(r.amount), 0);
                const expense = dayRecs
                  .filter((r) => r.transaction_type === "EXPENSE")
                  .reduce((s, r) => s + parseFloat(r.amount), 0);
                const bal = income - expense;

                return React.createElement(
                  "div",
                  { key: date, className: "bg-white rounded-lg shadow overflow-hidden" },
                  React.createElement(
                    "div",
                    { className: "px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b" },
                    React.createElement(
                      "div",
                      { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                      React.createElement(
                        "div",
                        { className: "flex items-center gap-2 sm:gap-3" },
                        React.createElement(Calendar, { className: "text-gray-600", size: 18 }),
                        React.createElement(
                          "h3",
                          { className: "text-sm sm:text-base font-semibold text-gray-900" },
                          new Date(date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        )
                      ),
                      React.createElement(
                        "div",
                        { className: "text-left sm:text-right" },
                        React.createElement("div", { className: "text-xs text-gray-500" }, "Net Balance"),
                        React.createElement(
                          "div",
                          { className: `text-lg sm:text-xl font-bold ${bal >= 0 ? "text-green-600" : "text-red-600"}` },
                          `₹ ${bal.toFixed(2)}`
                        )
                      )
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "overflow-x-auto" },
                    React.createElement(
                      "table",
                      { className: "w-full" },
                      React.createElement(
                        "thead",
                        { className: "bg-gray-50 border-b" },
                        React.createElement(
                          "tr",
                          null,
                          ["Type", "Category", "Bus", "Amount", "Attachments", "Action"].map((th, i) =>
                            React.createElement(
                              "th",
                              {
                                key: i,
                                className: `px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                  i === 2 ? "hidden sm:table-cell" : ""
                                } ${i === 3 || i === 5 ? "text-right" : ""} ${i === 4 ? "text-center" : ""}`,
                              },
                              th
                            )
                          )
                        )
                      ),
                      React.createElement(
                        "tbody",
                        { className: "bg-white divide-y divide-gray-200" },
                        dayRecs.map((r) =>
                          React.createElement(
                            "tr",
                            { key: r.id, className: "hover:bg-gray-50" },
                            React.createElement(
                              "td",
                              { className: "px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap" },
                              React.createElement(
                                "span",
                                {
                                  className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    r.transaction_type === "INCOME" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`,
                                },
                                r.transaction_type === "INCOME" ? "IN" : "EXP"
                              )
                            ),
                            React.createElement(
                              "td",
                              { className: "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900" },
                              React.createElement("div", { className: "max-w-xs truncate" }, r.category_name),
                              React.createElement("div", { className: "text-xs text-gray-500 sm:hidden" }, r.bus_name || "-")
                            ),
                            React.createElement(
                              "td",
                              { className: "px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell" },
                              r.bus_name || "-"
                            ),
                            React.createElement(
                              "td",
                              { className: "px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-right font-semibold" },
                              React.createElement(
                                "span",
                                { className: r.transaction_type === "INCOME" ? "text-green-600" : "text-red-600" },
                                `₹ ${parseFloat(r.amount).toFixed(2)}`
                              )
                            ),
                           
                            // NEW: View Files Column
                            React.createElement(
                              "td",
                              { className: "px-3 sm:px-6 py-3 sm:py-4 text-center" },
                              React.createElement(
                                "div",
                                { className: "flex justify-center gap-1.5" },
                                dayRecs.some(
                                  (rec) =>
                                    rec.transaction_type === "INCOME" && rec.attachments?.length > 0
                                ) &&
                                  React.createElement(
                                    "button",
                                    {
                                      onClick: () => {
                                        const incomeAtts = dayRecs
                                          .filter((rec) => rec.transaction_type === "INCOME")
                                          .flatMap((rec) => rec.attachments || []);
                                        setModalTitle(`Income Attachments – ${new Date(date).toLocaleDateString()}`);
                                        setModalAttachments(incomeAtts);
                                        setModalOpen(true);
                                      },
                                      className:
                                        "flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded hover:bg-green-200 transition",
                                    },
                                    React.createElement(FolderOpen, { size: 14 }),
                                    "Income"
                                  ),
                                dayRecs.some(
                                  (rec) =>
                                    rec.transaction_type === "EXPENSE" && rec.attachments?.length > 0
                                ) &&
                                  React.createElement(
                                    "button",
                                    {
                                      onClick: () => {
                                        const expenseAtts = dayRecs
                                          .filter((rec) => rec.transaction_type === "EXPENSE")
                                          .flatMap((rec) => rec.attachments || []);
                                        setModalTitle(`Expense Attachments – ${new Date(date).toLocaleDateString()}`);
                                        setModalAttachments(expenseAtts);
                                        setModalOpen(true);
                                      },
                                      className:
                                        "flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded hover:bg-red-200 transition",
                                    },
                                    React.createElement(FolderOpen, { size: 14 }),
                                    "Expense"
                                  )
                              )
                            ),
                            React.createElement(
                              "td",
                              { className: "px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm" },
                              React.createElement(
                                "button",
                                {
                                  onClick: () => deleteRecord(r.id),
                                  className: "p-1 text-red-600 hover:text-red-800",
                                },
                                React.createElement(Trash2, { size: 16 })
                              )
                            )
                          )
                        )
                      ),
                      React.createElement(
                        "tfoot",
                        { className: "bg-gray-50 border-t-2" },
                        React.createElement(
                          "tr",
                          null,
                          React.createElement(
                            "td",
                            { colSpan: 4, className: "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-700" },
                            "Daily Summary"
                          ),
                          React.createElement(
                            "td",
                            { className: "px-3 sm:px-6 py-3 sm:py-4 text-right" },
                            React.createElement(
                              "div",
                              { className: "space-y-1" },
                              React.createElement(
                                "div",
                                null,
                                React.createElement("div", { className: "text-xs text-gray-500" }, "Income"),
                                React.createElement(
                                  "div",
                                  { className: "text-xs sm:text-sm font-bold text-green-600" },
                                  `₹ ${income.toFixed(2)}`
                                )
                              ),
                              React.createElement(
                                "div",
                                null,
                                React.createElement("div", { className: "text-xs text-gray-500" }, "Expense"),
                                React.createElement(
                                  "div",
                                  { className: "text-xs sm:text-sm font-bold text-red-600" },
                                  `₹ ${expense.toFixed(2)}`
                                )
                              )
                            )
                          ),
                          React.createElement("td", null)
                        )
                      )
                    )
                  )
                );
              })
            )
      ),

    // NEW: Render Modal at the end
    React.createElement(AttachmentsModal, {
      isOpen: modalOpen,
      onClose: () => setModalOpen(false),
      title: modalTitle,
      attachments: modalAttachments,
    })
  );
}
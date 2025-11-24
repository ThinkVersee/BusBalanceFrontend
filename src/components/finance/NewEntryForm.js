"use client";

import React, { useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Save,
  Loader2,
  Upload,
  X,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

const NumberInput = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const handleWheel = () => inputRef.current?.blur();

  return (
    <input
      ref={inputRef}
      type="number"
      step="0.01"
      min="0"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onWheel={handleWheel}
      placeholder="0.00"
      className="w-24 sm:w-32 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-current bg-white text-gray-900"
    />
  );
};

const FileInputSection = ({ files, setFiles }) => {
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <Upload size={18} className="text-red-600" />
        <h4 className="font-medium text-sm">Expense Attachments</h4>
      </div>
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-red-50 file:text-red-700 hover:file:bg-red-100 bg-white"
      />
      {files.length > 0 && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border text-xs"
            >
              <div className="flex items-center gap-1 text-green-600 truncate max-w-[200px] sm:max-w-xs">
                <CheckCircle size={14} />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NewEntryForm({
  formData,
  setFormData,
  ownedBuses,
  incomeCategories,
  expenseCategories,
  updateIncomeAmount,
  updateExpenseAmount,
  showAddIncome,
  setShowAddIncome,
  showAddExpense,
  setShowAddExpense,
  newCategoryName,
  setNewCategoryName,
  addNewCategory,
  deleteCategory,
  expenseFiles,
  setExpenseFiles,
  totalIncome,
  totalExpense,
  balance,
  handleSave,
  saving,
  isOwner,
  duplicateWarnings,
}) {

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">

      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b bg-gray-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Number <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.bus}
              onChange={(e) => setFormData({ ...formData, bus: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Select Bus</option>
              {ownedBuses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.bus_name} ({bus.registration_number})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="p-4 sm:p-6 border-t lg:border-t-0 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-600" size={20} />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Expenses</h2>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
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
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900"
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
           <div className="mt-5 flex justify-center">
  <button
    onClick={() => addNewCategory("EXPENSE")}
    className="w-full sm:w-auto px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
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
              <NumberInput
                value={cat.amount}
                onChange={(v) => updateExpenseAmount(cat.id, v)}
              />
              {isOwner && (
                <button
                  onClick={() => deleteCategory(cat.id, "EXPENSE")}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <FileInputSection files={expenseFiles} setFiles={setExpenseFiles} />
      </div>

      {/* Income Section */}
      <div className="p-4 sm:p-6 border-t bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Income</h2>
          </div>
          <button
            onClick={() => setShowAddIncome(true)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
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
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900"
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
            <div className="mt-5 flex justify-center">
  <button
    onClick={() => addNewCategory("INCOME")}
    className="w-full sm:w-auto px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
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
              <NumberInput
                value={cat.amount}
                onChange={(v) => updateIncomeAmount(cat.id, v)}
              />
              {isOwner && (
                <button
                  onClick={() => deleteCategory(cat.id, "INCOME")}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary - Compact & Mobile-Optimized */}
{/* Summary - Compact for Mobile, Old Layout for Desktop */}
<div className="border-t bg-gray-50">
  <div className="p-4 sm:p-6">
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
        <IndianRupee size={18} />
      </div>
      <h3 className="font-bold text-gray-800 text-sm sm:text-base">Summary</h3>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      {/* Income */}
      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
        
        {/* MOBILE (single line) */}
        <div className="flex sm:hidden items-center justify-between text-sm font-semibold text-green-700">
          <span>Income</span>
          <span>₹{totalIncome.toFixed(0)}</span>
        </div>

        {/* DESKTOP (old layout) */}
        <div className="hidden sm:block text-green-700">
          <div className="text-xs font-medium">Income</div>
          <div className="text-xl font-extrabold mt-1">
            ₹{totalIncome.toFixed(0)}
          </div>
        </div>

      </div>

      {/* Expense */}
      <div className="bg-red-50 rounded-lg p-3 border border-red-200">

        {/* MOBILE (single line) */}
        <div className="flex sm:hidden items-center justify-between text-sm font-semibold text-red-700">
          <span>Expense</span>
          <span>₹{totalExpense.toFixed(0)}</span>
        </div>

        {/* DESKTOP (old layout) */}
        <div className="hidden sm:block text-red-700">
          <div className="text-xs font-medium">Expense</div>
          <div className="text-xl font-extrabold mt-1">
            ₹{totalExpense.toFixed(0)}
          </div>
        </div>

      </div>

      {/* Net Balance */}
      <div
        className={`rounded-lg p-3 border ${
          balance >= 0
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        {/* MOBILE (single line) */}
        <div
          className={`flex sm:hidden items-center justify-between text-sm font-semibold ${
            balance >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          <span>Net</span>
          <span>
            {balance >= 0 ? "₹" : "-₹"}
            {Math.abs(balance).toFixed(0)}
          </span>
        </div>

        {/* DESKTOP (old layout) */}
        <div
          className={`hidden sm:block ${
            balance >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          <div className="text-xs font-medium">Net</div>
          <div className="text-xl font-extrabold mt-1">
            {balance >= 0 ? "₹" : "-₹"}
            {Math.abs(balance).toFixed(0)}
          </div>
        </div>
      </div>

    </div>

    {/* Save Button */}
   <div className="mt-5 flex justify-end">

<button
  onClick={handleSave}
  disabled={saving}
  className={`w-full sm:w-64 py-3 rounded-lg font-semibold text-white text-sm sm:text-base 
    flex items-center justify-center gap-2 transition-all shadow-sm
    ${saving 
      ? "bg-blue-400 cursor-not-allowed" 
      : "bg-blue-600 hover:bg-blue-700 active:scale-98"
    }`}
>
  {saving ? (
    <>
      <Loader2 className="animate-spin" size={18} />
      Saving...
    </>
  ) : (
    <>
      <Save size={18} />
      Save Entry
    </>
  )}
</button>
    </div>

    
  </div>
</div>

    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader2,
  FileText,
  X,
  TrendingUp,
  Wallet,
  User,
  Filter,
  Download,
} from "lucide-react";
import axiosInstance from '@/config/axiosInstance';

/* -------------------------------------------------------------------------- */
/*                          TRANSACTION TYPE CONFIG                           */
/* -------------------------------------------------------------------------- */
const TRANSACTION_CONFIG = {
  INCOME: {
    label: "IN",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    amountColor: "text-green-600",
  },
  MAINTENANCE: {
    label: "MNT",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    amountColor: "text-red-600",
  },
  WITHDRAWAL: {
    label: "WD",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    amountColor: "text-red-600",
  },
  EXPENSE: {
    label: "EXP",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    amountColor: "text-red-600",
  },
};

/* -------------------------------------------------------------------------- */
/*                               STAFF BADGE                                  */
/* -------------------------------------------------------------------------- */
const StaffBadge = ({ role, name }) => {
  if (!name) return null;

  const getConfig = (role) => {
    switch (role) {
      case "DRIVER":
        return { bgColor: "bg-blue-100", textColor: "text-blue-700", iconColor: "text-blue-600", label: "Driver" };
      case "CONDUCTOR":
        return { bgColor: "bg-green-100", textColor: "text-green-700", iconColor: "text-green-600", label: "Conductor" };
      case "CLEANER":
        return { bgColor: "bg-orange-100", textColor: "text-orange-700", iconColor: "text-orange-600", label: "Cleaner" };
      default:
        return { bgColor: "bg-gray-100", textColor: "text-gray-700", iconColor: "text-gray-600", label: "Staff" };
    }
  };

  const config = getConfig(role);

  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${config.bgColor}`}>
      <User size={10} className={`sm:w-3 sm:h-3 ${config.iconColor}`} />
      <span className={`text-[10px] sm:text-xs font-medium ${config.textColor}`}>
        {config.label}: {name}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                     TRANSACTION ITEM (NO ATTACHMENTS)                       */
/* -------------------------------------------------------------------------- */
const TransactionItem = ({ record, isOwner, onDelete }) => {
  const config = TRANSACTION_CONFIG[record.transaction_type] || TRANSACTION_CONFIG.EXPENSE;
  const displayName =
    record.bus_name || (record.transaction_type === "WITHDRAWAL" ? "Owner Wallet" : "No bus");

  const showReason = record.transaction_type === "WITHDRAWAL" && record.description?.trim();

  return (
    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-start gap-2 sm:gap-3 min-w-0 w-full">
        <span
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                {record.category_name}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                {displayName}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <span
                className={`font-bold text-base sm:text-lg whitespace-nowrap ${config.amountColor}`}
              >
                ₹{Number(record.amount).toFixed(0)}
              </span>

              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="text-red-600 hover:bg-red-50 rounded-lg transition-colors p-1"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              )}
            </div>
          </div>

          {showReason && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-600">
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Reason: {record.description.trim()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            ATTACHMENT ITEM                                 */
/* -------------------------------------------------------------------------- */
const AttachmentItem = ({ attachment }) => {
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(attachment.file_name);

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {isImage ? (
        <img
          src={attachment.file_url}
          alt={attachment.file_name}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover border border-gray-200"
        />
      ) : (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-[10px] sm:text-xs font-bold text-red-600">PDF</span>
        </div>
      )}
      <span className="flex-1 text-xs sm:text-sm font-medium truncate">
        {attachment.file_name}
      </span>
    </a>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SUMMARY CARD                                  */
/* -------------------------------------------------------------------------- */
const SummaryCard = ({ label, amount, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-lg sm:rounded-xl p-3 sm:p-4 text-center`}>
    <div className={`text-xs sm:text-sm font-medium ${textColor}`}>{label}</div>
    <div className={`text-xl sm:text-2xl font-bold ${textColor}`}>
      ₹{Number(amount).toFixed(0)}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                             WALLET BALANCE                                 */
/* -------------------------------------------------------------------------- */
const WalletBalance = ({ balance }) => {
  const isPositive = balance >= 0;
  const displayAmount = Math.abs(balance).toFixed(0);

  return (
    <div
      className={`mt-3 sm:mt-5 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 text-center ${
        isPositive
          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
          : "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
      }`}
    >
      <div className={`text-sm sm:text-lg font-semibold ${isPositive ? "text-green-800" : "text-red-800"}`}>
        Wallet Balance
      </div>
      <div className={`text-2xl sm:text-4xl font-extrabold mt-1 sm:mt-2 ${isPositive ? "text-green-700" : "text-red-700"}`}>
        {isPositive ? "+" : "-"}₹{displayAmount}
      </div>
      <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "Available funds" : "Outstanding amount"}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           DAILY SUMMARY HEADER                             */
/* -------------------------------------------------------------------------- */
const DailySummaryHeader = ({ date, netCollection, isOpen, onToggle }) => (
  <div
    className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-100 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-200"
    onClick={onToggle}
  >
    <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
      {isOpen ? <ChevronDown size={18} className="sm:w-5 sm:h-5 flex-shrink-0" /> : <ChevronRight size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />}
      <Calendar size={16} className="text-blue-600 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-xs sm:text-base truncate">
          {new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </div>

    <div className="text-right flex-shrink-0">
      <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Net</div>
      <div className={`font-bold text-base sm:text-xl ${netCollection >= 0 ? "text-green-600" : "text-red-600"}`}>
        ₹{netCollection.toFixed(0)}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                      WITHDRAWAL DATE HEADER                                */
/* -------------------------------------------------------------------------- */
const WithdrawalDateHeader = ({ date, totalAmount, isOpen, onToggle }) => (
  <div
    className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-100 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-200"
    onClick={onToggle}
  >
    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
      {isOpen ? <ChevronDown size={18} className="text-gray-700 sm:w-5 sm:h-5 flex-shrink-0" /> : <ChevronRight size={18} className="text-gray-700 sm:w-5 sm:h-5 flex-shrink-0" />}
      <Calendar size={16} className="text-blue-600 flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
      <div className="font-bold text-gray-900 text-xs sm:text-base truncate">
        {new Date(date).toLocaleDateString("en-IN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>

    <div className="text-right flex-shrink-0">
      <div className="text-[10px] sm:text-xs text-gray-600 font-medium">Total</div>
      <div className="font-bold text-base sm:text-xl text-purple-700">
        -₹{totalAmount.toFixed(0)}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                           ATTACHMENTS MODAL                                */
/* -------------------------------------------------------------------------- */
const AttachmentsModal = ({ isOpen, title, attachments, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden">
          <div className="flex justify-between items-center p-3 sm:p-4 border-b sticky top-0 bg-white">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto max-h-[60vh]">
            {attachments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attachments found</p>
            ) : (
              attachments.map((attachment, index) => (
                <AttachmentItem key={attachment.id || index} attachment={attachment} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                    UPDATED: CUSTOM DATE RANGE REPORT MODAL                 */
/* -------------------------------------------------------------------------- */
const CustomRangeReportModal = ({ isOpen, onClose, onDownload, buses = [] }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBus, setSelectedBus] = useState(""); // "" = All Buses
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      alert("To date cannot be earlier than From date");
      return;
    }

    setLoading(true);
    try {
      await onDownload(fromDate, toDate, selectedBus || null);
      onClose();
    } catch (err) {
      alert("Failed to download report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center p-5 border-b">
            <h3 className="font-bold text-lg text-gray-900">Download Custom Date Range Report</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                min={fromDate}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bus Filter</label>
              <div className="relative">
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-white border-2 border-gray-300 rounded-lg text-base font-medium focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                >
                  <option value="">All Buses ({buses.length})</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.bus_name}>
                      {bus.bus_name} {bus.registration_number ? `(${bus.registration_number})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                {selectedBus && (
                  <button
                    onClick={() => setSelectedBus("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <Download size={22} />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */
export default function RecordsTab({
  records,
  loadingRecords,
  summary = {},
  openDates,
  toggleDate,
  deleteRecord,
  isOwner,
  modalOpen,
  setModalOpen,
  modalTitle,
  setModalTitle,
  modalAttachments,
  setModalAttachments,
}) {
  const [activeTab, setActiveTab] = useState("transactions");
  const [dateBusFilters, setDateBusFilters] = useState({});
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [ownerBuses, setOwnerBuses] = useState([]);

  // Fetch owner's buses
  useEffect(() => {
    if (isOwner) {
      axiosInstance.get("/finance/buses/") // Your endpoint to get owner's buses
        .then(res => setOwnerBuses(res.data))
        .catch(err => console.error("Failed to load buses:", err));
    }
  }, [isOwner]);

  const {
    total_income = 0,
    total_expense = 0,
    total_maintenance = 0,
    total_withdrawal = 0,
    balance = 0,
  } = summary;

  const today = new Date().toISOString().split("T")[0];
  const displayRecords = isOwner ? records : records.filter((r) => r.date === today);

  const regularTransactions = displayRecords.filter((r) => r.transaction_type !== "WITHDRAWAL");

  const regularRecordsByDate = regularTransactions.reduce((grouped, record) => {
    const dateKey = record.date || "unknown";
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(record);
    return grouped;
  }, {});

  const regularDates = Object.keys(regularRecordsByDate).sort((a, b) => new Date(b) - new Date(a));

  const withdrawalTransactions = records.filter((r) => r.transaction_type === "WITHDRAWAL");
  const withdrawalsByDate = withdrawalTransactions.reduce((grouped, record) => {
    const dateKey = record.date || "unknown";
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(record);
    return grouped;
  }, {});
  const withdrawalDates = Object.keys(withdrawalsByDate).sort((a, b) => new Date(b) - new Date(a));

  const calculateDailyTotals = (dayRecords) => {
    const totals = {
      totalIncome: 0,
      totalExpense: 0,
      totalMaintenance: 0,
      staffAssignments: { driver: "", conductor: "", cleaner: "" },
    };

    dayRecords.forEach((record) => {
      const amount = Number(record.amount || 0);
      switch (record.transaction_type) {
        case "INCOME": totals.totalIncome += amount; break;
        case "EXPENSE": totals.totalExpense += amount; break;
        case "MAINTENANCE": totals.totalMaintenance += amount; break;
      }

      if (record.staff_names) {
        if (!totals.staffAssignments.driver) totals.staffAssignments.driver = record.staff_names.driver || "";
        if (!totals.staffAssignments.conductor) totals.staffAssignments.conductor = record.staff_names.conductor || "";
        if (!totals.staffAssignments.cleaner) totals.staffAssignments.cleaner = record.staff_names.cleaner || "";
      }
    });

    totals.netCollection = totals.totalIncome - (totals.totalExpense + totals.totalMaintenance);
    return totals;
  };

  const getUniqueBusNamesForDate = (date) => {
    const dayRecords = regularRecordsByDate[date] || [];
    const busNames = new Set();
    dayRecords.forEach((record) => {
      const name = record.bus_name?.trim();
      if (name) busNames.add(name);
    });
    return Array.from(busNames).sort();
  };

const downloadReport = async (date, busName = null) => {
  try {
    const params = new URLSearchParams();
    params.append("date", date);
    if (busName) params.append("bus", busName);

    // Get the filtered attachments for this date and bus
    const dayRecords = regularRecordsByDate[date] || [];
    const filteredRecords = busName
      ? dayRecords.filter((r) => (r.bus_name?.trim() || "") === busName)
      : dayRecords;

    const dayAttachments = filteredRecords
      .flatMap((record) => record.attachments || [])
      .filter((att) => att && att.file_url);

    // Send attachments as JSON in query (we'll parse in backend)
    if (dayAttachments.length > 0) {
      params.append("attachments", JSON.stringify(dayAttachments));
    }

    const response = await axiosInstance.get(`/finance/reports/daily-pdf/?${params.toString()}`, {
      responseType: 'blob',
    });

    const filename = `Daily_Report_${date}${busName ? `_${busName}` : ''}.pdf`;

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("Failed to download daily PDF");
  }
};

const downloadRangeReport = async (fromDate, toDate, busName = null) => {
  try {
    const params = new URLSearchParams();
    params.append("from_date", fromDate);
    params.append("to_date", toDate);
    
    // KEY FIX: Only append 'bus' parameter if busName is NOT null/empty
    if (busName) {
      params.append("bus", busName);
    }
    
    console.log("Requesting URL with params:", params.toString()); // Debug log

    const response = await axiosInstance.get(`/finance/reports/range-pdf/?${params.toString()}`, {
      responseType: 'blob',
    });

    const filename = busName 
      ? `Report_${fromDate}_to_${toDate}_${busName.replace(/\s+/g, '_')}.pdf` 
      : `Report_${fromDate}_to_${toDate}_All_Buses.pdf`;

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download error:", err);
    throw err;
  }
};

  return (
    <>
      {/* SUMMARY SECTION */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-5 mb-3 sm:mb-6">
        <div className={`grid grid-cols-2 ${isOwner ? "lg:grid-cols-4" : "sm:grid-cols-3"} gap-3 sm:gap-4`}>
          <SummaryCard label="Total Income" amount={total_income} bgColor="bg-gradient-to-br from-green-50 to-green-100" textColor="text-green-700" />
          <SummaryCard label="Regular Expense" amount={total_expense} bgColor="bg-gradient-to-br from-red-50 to-red-100" textColor="text-red-700" />
          <SummaryCard label="Maintenance" amount={total_maintenance} bgColor="bg-gradient-to-br from-orange-50 to-orange-100" textColor="text-orange-700" />
          {isOwner && (
            <SummaryCard label="Owner Withdrawal" amount={total_withdrawal} bgColor="bg-gradient-to-br from-purple-50 to-purple-100" textColor="text-purple-700" />
          )}
        </div>
        {isOwner && <WalletBalance balance={balance} />}
      </div>

      {/* TABS */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-1.5 sm:p-2 mb-3 sm:mb-6">
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all ${
              activeTab === "transactions" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <TrendingUp size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Daily Transactions</span>
            <span className="sm:hidden">Transactions</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab("withdrawals")}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all ${
                activeTab === "withdrawals" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Wallet size={16} className="sm:w-5 sm:h-5" />
              Withdrawals
            </button>
          )}
        </div>
      </div>
      <div className="">
      {/* Floating Custom Report Button */}
      {isOwner && (
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => setRangeModalOpen(true)}
            className="flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm rounded-full   transition-all hover:scale-105 active:scale-95"
          >
            <Download size={24} />
            <span> Report</span>
          </button>
        </div>
      )}
</div>
      {/* MAIN CONTENT */}
      {loadingRecords ? (
        <div className="flex justify-center py-12 sm:py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <>
          {activeTab === "transactions" && (
            <>
              {regularDates.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <FileText className="mx-auto text-gray-300 mb-3 sm:mb-4" size={48} />
                  <p className="text-gray-500 font-medium text-sm sm:text-lg">
                    {isOwner ? "No daily transactions found" : "No transactions for today"}
                  </p>
                  {!isOwner && (
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                      Only today's records are visible to staff
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-6">
                  {regularDates.map((date) => {
                    const dailyRecords = regularRecordsByDate[date] || [];
                    const dailyTotals = calculateDailyTotals(dailyRecords);
                    const isDateOpen = openDates[date];

                    const selectedBusName = dateBusFilters[date] || "";
                    const filteredRecords = selectedBusName
                      ? dailyRecords.filter((r) => (r.bus_name?.trim() || "") === selectedBusName)
                      : dailyRecords;

                    const busNamesOnDate = getUniqueBusNamesForDate(date);

                    const hasStaff =
                      dailyTotals.staffAssignments.driver ||
                      dailyTotals.staffAssignments.conductor ||
                      dailyTotals.staffAssignments.cleaner;

                    const dayAttachments = filteredRecords
                      .flatMap((record) => record.attachments || [])
                      .filter((att) => att && att.file_url);

                    const hasAttachments = dayAttachments.length > 0;

                    return (
                      <div key={date} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                        <DailySummaryHeader
                          date={date}
                          netCollection={dailyTotals.netCollection}
                          isOpen={isDateOpen}
                          onToggle={() => toggleDate(date)}
                        />

                        {isDateOpen && (
                          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                            {hasStaff && (
                              <div className="flex flex-wrap gap-2 sm:gap-3 pb-2 border-b border-gray-200">
                                {dailyTotals.staffAssignments.driver && (
                                  <StaffBadge role="DRIVER" name={dailyTotals.staffAssignments.driver} />
                                )}
                                {dailyTotals.staffAssignments.conductor && (
                                  <StaffBadge role="CONDUCTOR" name={dailyTotals.staffAssignments.conductor} />
                                )}
                                {dailyTotals.staffAssignments.cleaner && (
                                  <StaffBadge role="CLEANER" name={dailyTotals.staffAssignments.cleaner} />
                                )}
                              </div>
                            )}

                            {busNamesOnDate.length > 1 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <Filter size={16} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
                                  <span className="font-semibold text-gray-800 text-xs sm:text-base">Filter by Bus</span>
                                </div>
                                <div className="relative">
                                  <select
                                    value={selectedBusName}
                                    onChange={(e) =>
                                      setDateBusFilters((prev) => ({
                                        ...prev,
                                        [date]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-9 sm:pr-10 bg-white border-2 border-blue-300 rounded-lg text-xs sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                  >
                                    <option value="">All Buses ({dailyRecords.length})</option>
                                    {busNamesOnDate.map((name) => {
                                      const count = dailyRecords.filter((r) => r.bus_name?.trim() === name).length;
                                      return (
                                        <option key={name} value={name}>
                                          {name} ({count})
                                        </option>
                                      );
                                    })}
                                  </select>
                                  {selectedBusName && (
                                    <button
                                      onClick={() =>
                                        setDateBusFilters((prev) => ({
                                          ...prev,
                                          [date]: "",
                                        }))
                                      }
                                      className="absolute right-9 sm:right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                      <X size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                  )}
                                  <ChevronDown
                                    size={16}
                                    className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none sm:w-[18px] sm:h-[18px]"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-3">
                              {hasAttachments && (
                                <button
                                  onClick={() => {
                                    setModalOpen(true);
                                    setModalTitle(
                                      `Attachments${selectedBusName ? ` - ${selectedBusName}` : ""} (${dayAttachments.length})`
                                    );
                                    setModalAttachments(dayAttachments);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                                >
                                  <FileText size={16} className="text-blue-600" />
                                  <span className="text-xs font-medium text-blue-800">
                                    {dayAttachments.length} file{dayAttachments.length > 1 ? "s" : ""}
                                  </span>
                                </button>
                              )}

                         <button
  onClick={() => {
    // NEW LOGIC: Auto-use the single bus when there's only one (no filter shown)
    let busToUse = selectedBusName;

    // If no bus selected in filter AND only one bus exists that day → use it automatically
    if (!selectedBusName && busNamesOnDate.length === 1) {
      busToUse = busNamesOnDate[0];
    }

    downloadReport(date, busToUse || null);
  }}
  className="flex items-center gap-2 px-4 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-green-800 font-medium ml-auto"
>
  <Download size={16} />
  <span className="text-xs">Report (PDF)</span>
</button>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              {filteredRecords
                                .filter((r) => r.transaction_type === "INCOME")
                                .map((record) => (
                                  <TransactionItem
                                    key={record.id}
                                    record={record}
                                    isOwner={isOwner}
                                    onDelete={deleteRecord}
                                  />
                                ))}

                              {filteredRecords
                                .filter((r) => r.transaction_type === "EXPENSE" || r.transaction_type === "MAINTENANCE")
                                .map((record) => (
                                  <TransactionItem
                                    key={record.id}
                                    record={record}
                                    isOwner={isOwner}
                                    onDelete={deleteRecord}
                                  />
                                ))}
                            </div>

                            {filteredRecords.length === 0 && (
                              <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-base">
                                No transactions found for selected filter
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "withdrawals" && isOwner && (
            <>
              {withdrawalDates.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <Wallet className="mx-auto text-gray-300 mb-3 sm:mb-4" size={48} />
                  <p className="text-gray-500 font-medium text-sm sm:text-lg">No withdrawals found</p>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                    Owner withdrawals will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-6">
                  {withdrawalDates.map((date) => {
                    const dailyWithdrawals = withdrawalsByDate[date] || [];
                    const isDateOpen = openDates[date];

                    const withdrawalTotal = dailyWithdrawals.reduce(
                      (sum, record) => sum + Number(record.amount || 0),
                      0
                    );

                    return (
                      <div key={date} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                        <WithdrawalDateHeader
                          date={date}
                          totalAmount={withdrawalTotal}
                          isOpen={isDateOpen}
                          onToggle={() => toggleDate(date)}
                        />

                        {isDateOpen && (
                          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50">
                            {dailyWithdrawals.map((record) => (
                              <TransactionItem
                                key={record.id}
                                record={record}
                                isOwner={isOwner}
                                onDelete={deleteRecord}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      <AttachmentsModal
        isOpen={modalOpen}
        title={modalTitle}
        attachments={modalAttachments}
        onClose={() => setModalOpen(false)}
      />

      <CustomRangeReportModal
        isOpen={rangeModalOpen}
        onClose={() => setRangeModalOpen(false)}
        onDownload={downloadRangeReport}
        buses={ownerBuses}
      />
    </>
  );
}





"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader2,
  FileText,
  X,
  Wallet,
  User,
  Download,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import axiosInstance from '@/config/axiosInstance';

/* -------------------------------------------------------------------------- */
/* CONFIGURATIONS */
/* -------------------------------------------------------------------------- */
const TRANSACTION_CONFIG = {
  INCOME: { label: "IN", bg: "bg-green-100", text: "text-green-700", amount: "text-green-600" },
  MAINTENANCE: { label: "MNT", bg: "bg-orange-100", text: "text-orange-700", amount: "text-red-600" },
  WITHDRAWAL: { label: "WD", bg: "bg-purple-100", text: "text-purple-700", amount: "text-red-600" },
  EXPENSE: { label: "EXP", bg: "bg-red-100", text: "text-red-700", amount: "text-red-600" },
};

const STAFF_ROLE_CONFIG = {
  DRIVER: { bg: "bg-blue-100", text: "text-blue-700", icon: "text-blue-600", label: "Driver" },
  CONDUCTOR: { bg: "bg-green-100", text: "text-green-700", icon: "text-green-600", label: "Conductor" },
  CLEANER: { bg: "bg-orange-100", text: "text-orange-700", icon: "text-orange-600", label: "Cleaner" },
};

/* -------------------------------------------------------------------------- */
/* REUSABLE COMPONENTS */
/* -------------------------------------------------------------------------- */

const StaffBadge = ({ role, name }) => {
  if (!name) return null;
  const config = STAFF_ROLE_CONFIG[role] || { bg: "bg-gray-100", text: "text-gray-700", icon: "text-gray-600", label: "Staff" };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
      <User size={12} className={config.icon} />
      <span className={`text-xs font-medium ${config.text}`}>
        {config.label}: {name}
      </span>
    </div>
  );
};

const TransactionItem = ({ record, isOwner, onDelete }) => {
  const config = TRANSACTION_CONFIG[record.transaction_type] || TRANSACTION_CONFIG.EXPENSE;
  const displayName = record.bus_name || (record.transaction_type === "WITHDRAWAL" ? "Owner Wallet" : "No bus");
  const showReason = record.transaction_type === "WITHDRAWAL" && record.description?.trim();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text} shrink-0`}>
          {config.label}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 text-sm truncate">{record.category_name}</div>
              <div className="text-xs text-gray-500 truncate">{displayName}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`font-bold text-lg whitespace-nowrap ${config.amount}`}>
                ₹{Number(record.amount).toFixed(0)}
              </span>
              {isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                  className="text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
          {showReason && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
              </svg>
              <span className="break-words">Reason: {record.description.trim()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, amount, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl p-4 text-center`}>
    <div className={`text-sm font-medium ${textColor}`}>{label}</div>
    <div className={`text-2xl font-bold ${textColor}`}>₹{Number(amount).toFixed(0)}</div>
  </div>
);

const WalletBalance = ({ balance }) => {
  const isPositive = balance >= 0;
  const displayAmount = Math.abs(balance).toFixed(0);

  return (
    <div className={`mt-5 rounded-xl p-5 border-2 text-center ${
      isPositive
        ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
        : "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
    }`}>
      <div className={`text-lg font-semibold ${isPositive ? "text-green-800" : "text-red-800"}`}>
        Wallet Balance
      </div>
      <div className={`text-4xl font-extrabold mt-2 ${isPositive ? "text-green-700" : "text-red-700"}`}>
        {isPositive ? "+" : "-"}₹{displayAmount}
      </div>
      <div className={`text-xs mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "Available funds" : "Outstanding amount"}
      </div>
    </div>
  );
};

const BusSummary = ({ bus }) => {
  const totalExpense = bus.expense_maintenance_transactions.reduce(
    (sum, rec) => sum + Number(rec.amount),
    0
  );
  
  const totalIncome = bus.income_transactions.reduce(
    (sum, rec) => sum + Number(rec.amount),
    0
  );
  
  if (totalExpense === 0 && totalIncome === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {totalIncome > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-green-600">Total Income</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-700">
                ₹{totalIncome.toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {totalExpense > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingUp size={16} className="text-red-600" />
              </div>
              <div>
                <div className="text-xs font-medium text-red-600">Total Expenses</div>
                <div className="text-[10px] text-gray-600">(Regular + Maintenance)</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-red-700">
                ₹{totalExpense.toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BusHeader = ({ busDetails }) => {
  if (!busDetails) return null;
  return (
    <div className="text-center py-3 border-b border-gray-200 bg-gray-50 rounded-lg mb-4">
      <div className="text-lg font-semibold text-black">
        {busDetails.bus_name}{busDetails.route ? ` (${busDetails.route})` : ''}
      </div>
      {busDetails.registration_number && (
        <div className="text-base text-black mt-1">{busDetails.registration_number}</div>
      )}
    </div>
  );
};

const StaffBadgesRow = ({ assignments }) => {
  const { driver, conductor, cleaner } = assignments || {};
  if (!driver && !conductor && !cleaner) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {driver && <StaffBadge role="DRIVER" name={driver} />}
      {conductor && <StaffBadge role="CONDUCTOR" name={conductor} />}
      {cleaner && <StaffBadge role="CLEANER" name={cleaner} />}
    </div>
  );
};

const AttachmentsButton = ({ attachments, busName, onOpenModal }) => {
  if (attachments.length === 0) return null;

  return (
    <button
      onClick={() => onOpenModal(`Attachments - ${busName || "Unknown"} (${attachments.length})`, attachments)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
    >
      <FileText size={18} className="text-blue-600" />
      <span className="text-sm font-medium text-blue-800">
        {attachments.length} file{attachments.length > 1 ? "s" : ""}
      </span>
    </button>
  );
};

const DailyReportDownloadButton = ({ date, buses }) => {
  const [downloading, setDownloading] = useState(false);
  const singleBus = buses.length === 1 ? buses[0] : null;
  const singleBusId = singleBus?.bus_details?.id || null;

  const downloadDailyReport = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({ date });
      if (singleBusId) params.append("bus_id", singleBusId);
      const response = await axiosInstance.get(`/finance/reports/daily-pdf/?${params}`, { responseType: 'blob' });
      const filename = `Daily_Report_${date}${singleBus?.bus_details?.bus_name ? `_${singleBus.bus_details.bus_name.replace(/\s+/g, '_')}` : ''}.pdf`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download daily report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={downloadDailyReport}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 disabled:bg-green-50 rounded-lg text-green-800 font-medium transition-colors"
    >
      {downloading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Downloading...</span>
        </>
      ) : (
        <>
          <Download size={18} />
          <span className="text-sm">Download Report (PDF)</span>
        </>
      )}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* INFINITE SCROLL LOADING INDICATOR */
/* -------------------------------------------------------------------------- */

const InfiniteScrollLoading = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
    <p className="text-gray-600 text-sm">Loading more records...</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* MODALS */
/* -------------------------------------------------------------------------- */

const AttachmentItem = ({ attachment }) => {
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(attachment.file_name);
  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {isImage ? (
        <img src={attachment.file_url} alt={attachment.file_name} className="w-10 h-10 rounded object-cover border border-gray-200" />
      ) : (
        <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-xs font-bold text-red-600">PDF</span>
        </div>
      )}
      <span className="flex-1 text-sm font-medium truncate">{attachment.file_name}</span>
    </a>
  );
};

const AttachmentsModal = ({ isOpen, title, attachments, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
            {attachments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attachments found</p>
            ) : (
              attachments.map((att, i) => <AttachmentItem key={att.id || i} attachment={att} />)
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT - INFINITE SCROLL VERSION */
/* -------------------------------------------------------------------------- */

export default function RecordsTab({
  loadingRecords,
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
  const [dailyGroups, setDailyGroups] = useState([]);
  const [withdrawalsByDate, setWithdrawalsByDate] = useState([]);
  const [busFilters, setBusFilters] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  
  // Separate infinite scroll states for each tab
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(true);
  const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);
  const [loadingMoreWithdrawals, setLoadingMoreWithdrawals] = useState(false);
  
  // Separate observer refs for each tab
  const transactionsObserverTarget = useRef(null);
  const withdrawalsObserverTarget = useRef(null);
  
  // Summary state
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    total_maintenance: 0,
    total_withdrawal: 0,
    balance: 0,
  });

  // Local state for open dates (expanded/collapsed)
  const [openDates, setOpenDates] = useState({});

  // Track if we've made the initial API call for each tab
  const initialTransactionsLoad = useRef(false);
  const initialWithdrawalsLoad = useRef(false);

  // Toggle date expansion
  const toggleDate = useCallback((date) => {
    setOpenDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  }, []);

  // Open attachments modal
  const openAttachmentsModal = (title, attachments) => {
    setModalTitle(title);
    setModalAttachments(attachments);
    setModalOpen(true);
  };

  // Reset tab data when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset open dates and filters when switching tabs
    setOpenDates({});
    setBusFilters({});
  };

  // Load transaction data with infinite scroll
  const loadTransactions = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore && (!hasMoreTransactions || loadingMoreTransactions)) return;
    if (!isLoadMore && dataLoading) return;

    if (isLoadMore) {
      setLoadingMoreTransactions(true);
    } else {
      setDataLoading(true);
    }

    try {
      console.log('Loading transactions for page:', pageNum, 'isLoadMore:', isLoadMore);
      const response = await axiosInstance.get("/finance/transactions/report/", {
        params: {
          page: pageNum,
          page_size: 10
        },
        paramsSerializer: params => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            searchParams.append(key, params[key]);
          });
          return searchParams.toString();
        }
      });
      
      const newDailyGroups = response.data.daily_groups || [];
      const pagination = response.data.pagination || {};
      
      if (isLoadMore) {
        // Append new data for infinite scroll
        setDailyGroups(prev => [...prev, ...newDailyGroups]);
      } else {
        // Initial load
        setDailyGroups(newDailyGroups);
        setSummary(response.data.summary || {
          total_income: 0,
          total_expense: 0,
          total_maintenance: 0,
          total_withdrawal: 0,
          balance: 0,
        });
      }
      
      // Update hasMore based on pagination info
      setHasMoreTransactions(pagination.has_next || false);
      setTransactionsPage(pageNum);
      
    } catch (err) {
      console.error("Failed to load grouped records:", err);
    } finally {
      if (isLoadMore) {
        setLoadingMoreTransactions(false);
      } else {
        setDataLoading(false);
      }
    }
  }, [hasMoreTransactions, loadingMoreTransactions, dataLoading]);

  // Load withdrawals data with infinite scroll
  const loadWithdrawals = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore && (!hasMoreWithdrawals || loadingMoreWithdrawals)) return;
    if (!isLoadMore && dataLoading) return;

    if (isLoadMore) {
      setLoadingMoreWithdrawals(true);
    } else {
      setDataLoading(true);
    }

    try {
      console.log('Loading withdrawals for page:', pageNum, 'isLoadMore:', isLoadMore);
      const response = await axiosInstance.get("/finance/transactions/withdrawals/", {
        params: {
          page: pageNum,
          page_size: 10
        },
        paramsSerializer: params => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            searchParams.append(key, params[key]);
          });
          return searchParams.toString();
        }
      });
      
      const newWithdrawals = response.data.withdrawals_by_date || [];
      const pagination = response.data.pagination || {};
      
      if (isLoadMore) {
        // Append new data for infinite scroll
        setWithdrawalsByDate(prev => [...prev, ...newWithdrawals]);
      } else {
        // Initial load
        setWithdrawalsByDate(newWithdrawals);
      }
      
      // Update hasMore based on pagination info
      setHasMoreWithdrawals(pagination.has_next || false);
      setWithdrawalsPage(pageNum);
      
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
    } finally {
      if (isLoadMore) {
        setLoadingMoreWithdrawals(false);
      } else {
        setDataLoading(false);
      }
    }
  }, [hasMoreWithdrawals, loadingMoreWithdrawals, dataLoading]);

  // Load initial data for active tab
  useEffect(() => {
    if (activeTab === "transactions" && !initialTransactionsLoad.current) {
      initialTransactionsLoad.current = true;
      loadTransactions(1);
    }
    
    if (activeTab === "withdrawals" && !initialWithdrawalsLoad.current && isOwner) {
      initialWithdrawalsLoad.current = true;
      loadWithdrawals(1);
    }
  }, [activeTab, loadTransactions, loadWithdrawals, isOwner]);

  // Setup infinite scroll observer for transactions tab
  useEffect(() => {
    if (activeTab !== "transactions" || !transactionsObserverTarget.current || 
        loadingMoreTransactions || !hasMoreTransactions) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreTransactions && !loadingMoreTransactions) {
          console.log('Loading more transactions, current page:', transactionsPage);
          loadTransactions(transactionsPage + 1, true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(transactionsObserverTarget.current);

    return () => {
      if (transactionsObserverTarget.current) {
        observer.unobserve(transactionsObserverTarget.current);
      }
    };
  }, [loadTransactions, hasMoreTransactions, loadingMoreTransactions, transactionsPage, activeTab]);

  // Setup infinite scroll observer for withdrawals tab
  useEffect(() => {
    if (activeTab !== "withdrawals" || !withdrawalsObserverTarget.current || 
        loadingMoreWithdrawals || !hasMoreWithdrawals) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreWithdrawals && !loadingMoreWithdrawals) {
          console.log('Loading more withdrawals, current page:', withdrawalsPage);
          loadWithdrawals(withdrawalsPage + 1, true);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(withdrawalsObserverTarget.current);

    return () => {
      if (withdrawalsObserverTarget.current) {
        observer.unobserve(withdrawalsObserverTarget.current);
      }
    };
  }, [loadWithdrawals, hasMoreWithdrawals, loadingMoreWithdrawals, withdrawalsPage, activeTab]);

  // Function to refresh data when new entry is added
  const refreshData = useCallback(() => {
    if (activeTab === "transactions") {
      initialTransactionsLoad.current = false;
      setTransactionsPage(1);
      setHasMoreTransactions(true);
      setDailyGroups([]);
      loadTransactions(1);
    } else if (activeTab === "withdrawals" && isOwner) {
      initialWithdrawalsLoad.current = false;
      setWithdrawalsPage(1);
      setHasMoreWithdrawals(true);
      setWithdrawalsByDate([]);
      loadWithdrawals(1);
    }
  }, [activeTab, loadTransactions, loadWithdrawals, isOwner]);

  // You can call refreshData() when you know new data has been added
  // For example, when the parent component adds a new record:
  useEffect(() => {
    // This would be triggered by a prop change when new data is added
    // For now, we'll just listen to loadingRecords prop
    if (!loadingRecords && (dailyGroups.length > 0 || withdrawalsByDate.length > 0)) {
      // Data was just loaded, you might want to refresh if needed
      // But we don't want to refresh on every load, only when we know new data was added
    }
  }, [loadingRecords, dailyGroups.length, withdrawalsByDate.length]);

  const {
    total_income = 0,
    total_expense = 0,
    total_maintenance = 0,
    total_withdrawal = 0,
    balance = 0,
  } = summary;

  // Show loading state
  if (loadingRecords || (dataLoading && activeTab === "transactions" && !initialTransactionsLoad.current)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Loading transactions...</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className={`grid grid-cols-2 ${isOwner ? "lg:grid-cols-4" : "sm:grid-cols-3"} gap-4`}>
          <SummaryCard label="Total Income" amount={total_income} bgColor="bg-gradient-to-br from-green-50 to-green-100" textColor="text-green-700" />
          <SummaryCard label="Regular Expense" amount={total_expense} bgColor="bg-gradient-to-br from-red-50 to-red-100" textColor="text-red-700" />
          <SummaryCard label="Maintenance" amount={total_maintenance} bgColor="bg-gradient-to-br from-orange-50 to-orange-100" textColor="text-orange-700" />
          {isOwner && <SummaryCard label="Owner Withdrawal" amount={total_withdrawal} bgColor="bg-gradient-to-br from-purple-50 to-purple-100" textColor="text-purple-700" />}
        </div>
        {isOwner && <WalletBalance balance={balance} />}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("transactions")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all ${
              activeTab === "transactions" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <TrendingUp size={18} /> <span className="hidden sm:inline">Daily Transactions</span><span className="sm:hidden">Transactions</span>
          </button>
          {isOwner && (
            <button
              onClick={() => handleTabChange("withdrawals")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all ${
                activeTab === "withdrawals" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Wallet size={18} /> Withdrawals
            </button>
          )}
        </div>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {dailyGroups.length === 0 && !dataLoading ? (
            <div className="text-center py-20">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium text-lg">No daily transactions found</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {dailyGroups.map((group, index) => {
                  const isOpen = openDates[group.date];
                  const selectedBus = busFilters[group.date] || "";
                  const filteredBuses = selectedBus
                    ? group.buses.filter(bus => bus.bus_details?.bus_name === selectedBus)
                    : group.buses;

                  const hasMultipleBuses = group.buses.length > 1;

                  return (
                    <div key={`${group.date}-${index}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div
                        onClick={() => toggleDate(group.date)}
                        className="px-4 py-4 bg-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          <Calendar size={18} className="text-blue-600" />
                          <div className="font-bold text-gray-900">
                            {new Date(group.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Net</div>
                          <div className={`font-bold text-xl ${group.net_collection >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ₹{group.net_collection.toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 space-y-6">
                          {hasMultipleBuses && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Bus</label>
                              <div className="relative">
                                <select
                                  value={selectedBus}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setBusFilters(prev => ({ ...prev, [group.date]: e.target.value }));
                                  }}
                                  className="w-full px-4 py-3 pr-12 bg-white border-2 border-gray-300 rounded-lg appearance-none cursor-pointer text-gray-900 focus:border-blue-500 focus:outline-none hover:border-gray-400 transition-colors"
                                >
                                  <option value="">All Buses ({group.buses.length})</option>
                                  {group.buses.map(bus => (
                                    <option key={bus.bus_details?.bus_name} value={bus.bus_details?.bus_name}>
                                      {bus.bus_details?.bus_name} {bus.bus_details?.registration_number ? `(${bus.bus_details.registration_number})` : ""}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                              </div>
                            </div>
                          )}

                          {filteredBuses.map(bus => (
                            <div key={bus.bus_details?.bus_name || "no-bus"} className="space-y-4">
                              <BusHeader busDetails={bus.bus_details} />
                              <BusSummary bus={bus} />
                              <StaffBadgesRow assignments={bus.staff_assignments} />
                              <AttachmentsButton
                                attachments={bus.attachments}
                                busName={bus.bus_details?.bus_name}
                                onOpenModal={openAttachmentsModal}
                              />
                              <div className="space-y-3">
                                {bus.income_transactions.map(rec => (
                                  <TransactionItem key={rec.id} record={rec} isOwner={isOwner} onDelete={deleteRecord} />
                                ))}
                                {bus.expense_maintenance_transactions.map(rec => (
                                  <TransactionItem key={rec.id} record={rec} isOwner={isOwner} onDelete={deleteRecord} />
                                ))}
                              </div>
                            </div>
                          ))}

                          {filteredBuses.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No transactions for the selected bus filter.
                            </div>
                          )}

                          <div className="flex justify-end pt-4">
                            <DailyReportDownloadButton date={group.date} buses={group.buses} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Infinite scroll loading indicator and target for transactions */}
              <div ref={transactionsObserverTarget}>
                {loadingMoreTransactions && <InfiniteScrollLoading />}
              </div>
              
              {/* Show "no more data" message when all data is loaded */}
              {!hasMoreTransactions && dailyGroups.length > 0 && (
                <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-6">
                  No more transactions to load
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Withdrawals Tab */}
      {activeTab === "withdrawals" && isOwner && (
        withdrawalsByDate.length === 0 && !dataLoading ? (
          <div className="text-center py-20">
            <Wallet className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium text-lg">No withdrawals found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {withdrawalsByDate.map((wd, index) => {
              const isOpen = openDates[wd.date];
              return (
                <div key={`${wd.date}-${index}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div
                    onClick={() => toggleDate(wd.date)}
                    className="px-4 py-4 bg-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <Calendar size={18} className="text-blue-600" />
                      <div className="font-bold text-gray-900">
                        {new Date(wd.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Total</div>
                      <div className="font-bold text-xl text-purple-700">-₹{wd.total.toFixed(0)}</div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-4 space-y-3 bg-gray-50">
                      {wd.transactions.map(rec => (
                        <TransactionItem key={rec.id} record={rec} isOwner={isOwner} onDelete={deleteRecord} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Infinite scroll target for withdrawals */}
            <div ref={withdrawalsObserverTarget}>
              {loadingMoreWithdrawals && <InfiniteScrollLoading />}
            </div>
            
            {/* Show "no more data" message when all data is loaded */}
            {!hasMoreWithdrawals && withdrawalsByDate.length > 0 && (
              <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-6">
                No more withdrawals to load
              </div>
            )}
          </div>
        )
      )}

      <AttachmentsModal
        isOpen={modalOpen}
        title={modalTitle}
        attachments={modalAttachments}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
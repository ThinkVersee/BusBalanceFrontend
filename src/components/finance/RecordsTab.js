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
  RefreshCw,
  CreditCard,
  ChevronUp
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

const TransactionItem = ({ record, isOwner, onDelete,onOpenAttachments }) => {
  const config = TRANSACTION_CONFIG[record.transaction_type] || TRANSACTION_CONFIG.EXPENSE;
  const displayName = record.bus_name || (record.transaction_type === "WITHDRAWAL" ? "Owner Wallet" : "No bus");
  const showReason = record.transaction_type === "WITHDRAWAL" && record.description?.trim();

  const [expanded, setExpanded] = useState(false); 

  const hasItems = record.items && record.items.length > 0;
  const itemCount = hasItems ? record.items.length : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${config.bg} ${config.text}`}>
            {config.label}
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 text-sm truncate">
              {record.category_name || (hasItems ? `${itemCount} items` : "Unknown")}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">{displayName}</div>
          </div>
        </div>

  <div className="flex items-center gap-3 shrink-0">
  {record.attachments?.length > 0 && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpenAttachments(
          `Attachments - ${record.bus_name || "Transaction"}`,
          record.attachments
        );
      }}
      className="flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-700 text-xs font-semibold"
    >
      <FileText size={14} />
      Attachments - {record.attachments.length}
    </button>
  )}

  <span className={`font-bold text-lg whitespace-nowrap ${config.amount}`}>
    ₹{Number(record.total_amount || 0).toLocaleString("en-IN")}
  </span>

  {isOwner && (
    <button onClick={() => onDelete(record.id)}>
      <Trash2 size={18} />
    </button>
  )}
</div>

      </div>

      {/* Withdrawal reason/method */}
      {showReason && (
        <div className="px-4 pb-3 text-xs text-gray-600 border-t border-gray-100 pt-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-purple-600" />
            <span>Reason: {record.description.trim()}</span>
          </div>
          {record.withdrawal_method && (
            <div className="mt-1 flex items-center gap-2">
              Method: <strong>{record.withdrawal_method}</strong>
              {record.withdrawal_reference && <> • Ref: {record.withdrawal_reference}</>}
            </div>
          )}
        </div>
      )}

      {/* Expand/Collapse button */}
      {hasItems && itemCount > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 text-sm font-medium text-gray-700 transition-colors"
        >
          <span>
            {expanded ? "Hide" : "Show"} {itemCount} item{itemCount > 1 ? 's' : ''}
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      {/* Items breakdown (only when expanded) */}
      {expanded && hasItems && (
        <div className="px-4 pb-4 pt-2 bg-white">
          <div className="space-y-2.5 divide-y divide-gray-100">
            {record.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900">
                    {item.category_name}
                  </div>
                  {item.description && item.description.trim() !== item.category_name && (
                    <div className="text-xs text-gray-600 mt-0.5">
                      {item.description.trim()}
                    </div>
                  )}
                </div>
                <div className="font-medium text-gray-900 whitespace-nowrap">
                  ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback if no items */}
      {!hasItems && record.total_amount && (
        <div className="px-4 pb-4 pt-1 text-sm text-gray-700 border-t border-gray-100 bg-gray-50">
          Amount: ₹{Number(record.total_amount).toLocaleString('en-IN')}
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, amount, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl p-4 text-center`}>
    <div className={`text-sm font-medium ${textColor}`}>{label}</div>
    <div className={`text-2xl font-bold ${textColor}`}>₹{Number(amount || 0).toFixed(0)}</div>
  </div>
);

const WalletBalance = ({ balance }) => {
  const isPositive = balance >= 0;
  const displayAmount = Math.abs(balance || 0).toFixed(0);

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
  if (!bus) return null;
  
const totalExpense = (bus.expense_maintenance_transactions || []).reduce(
  (sum, rec) => sum + Number(rec.total_amount || 0),
  0
);
  
const totalIncome = (bus.income_transactions || []).reduce(
  (sum, rec) => sum + Number(rec.total_amount || 0),
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
        {busDetails.bus_name || "Unnamed Bus"}{busDetails.route ? ` (${busDetails.route})` : ''}
      </div>
      {busDetails.registration_number && (
        <div className="text-base text-black mt-1">{busDetails.registration_number}</div>
      )}
    </div>
  );
};

const StaffBadgesRow = ({ assignments }) => {
  if (!assignments) return null;
  const { driver, conductor, cleaner } = assignments;
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
  if (!attachments || attachments.length === 0) return null;

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
  const singleBus = buses && buses.length === 1 ? buses[0] : null;
  const singleBusId = singleBus?.bus_details?.id || null;

  const downloadDailyReport = async () => {
    if (!date) {
      alert("Date is required for downloading report");
      return;
    }
    
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
      disabled={downloading || !date}
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
/* LOAD MORE BUTTON */
/* -------------------------------------------------------------------------- */

const LoadMoreButton = ({ loading, hasMore, onClick, label = "Load More" }) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <ChevronDown size={20} />
          </>
        )}
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MODALS */
/* -------------------------------------------------------------------------- */

const AttachmentItem = ({ attachment }) => {
  if (!attachment) return null;
  
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
            <h3 className="font-semibold text-gray-900">{title || "Attachments"}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
            {!attachments || attachments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No attachments found</p>
            ) : (
              attachments.map((att, i) => <AttachmentItem key={att?.id || i} attachment={att} />)
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT - WITH LOAD MORE BUTTON */
/* -------------------------------------------------------------------------- */

export default function RecordsTab({
  loadingRecords,
  deleteRecord: deleteRecordProp,
  isOwner,
  modalOpen,
  setModalOpen,
  modalTitle,
  setModalTitle,
  modalAttachments,
  setModalAttachments,
  refreshTrigger = 0,
}) {
  const [activeTab, setActiveTab] = useState("transactions");
  const [dailyGroups, setDailyGroups] = useState([]);
  const [withdrawalsByDate, setWithdrawalsByDate] = useState([]);
  const [busFilters, setBusFilters] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [hasMoreWithdrawals, setHasMoreWithdrawals] = useState(true);
  const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);
  const [loadingMoreWithdrawals, setLoadingMoreWithdrawals] = useState(false);
  const [transactionsInitialized, setTransactionsInitialized] = useState(false);
  const [withdrawalsInitialized, setWithdrawalsInitialized] = useState(false);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    total_maintenance: 0,
    total_withdrawal: 0,
    balance: 0,
  });

  const [openDates, setOpenDates] = useState({});

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const toggleDate = useCallback((date) => {
    setOpenDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  }, []);

  const openAttachmentsModal = (title, attachments) => {
    setModalTitle(title);
    setModalAttachments(attachments || []);
    setModalOpen(true);
  };

  const handleDeleteRecord = useCallback(async (recordId) => {
    if (!isOwner) return;
    
    try {
      await deleteRecordProp(recordId);
      
      if (activeTab === "transactions") {
        setDailyGroups(prevGroups => {
          const updatedGroups = prevGroups.map(group => ({
            ...group,
            buses: group.buses
              ? group.buses.map(bus => ({
                  ...bus,
                  income_transactions: (bus.income_transactions || []).filter(rec => rec.id !== recordId),
                  expense_maintenance_transactions: (bus.expense_maintenance_transactions || []).filter(rec => rec.id !== recordId)
                })).filter(bus => 
                  (bus.income_transactions || []).length > 0 || 
                  (bus.expense_maintenance_transactions || []).length > 0
                )
              : []
          })).filter(group => (group.buses || []).length > 0);
          
          return updatedGroups;
        });
      } else if (activeTab === "withdrawals") {
        setWithdrawalsByDate(prevWithdrawals => {
          const updatedWithdrawals = prevWithdrawals.map(wd => ({
            ...wd,
            transactions: (wd.transactions || []).filter(rec => rec.id !== recordId)
          })).filter(wd => (wd.transactions || []).length > 0);
          
          return updatedWithdrawals.map(wd => ({
            ...wd,
            total: (wd.transactions || []).reduce((sum, rec) => sum + Number(rec.amount || 0), 0)
          }));
        });
      }
      
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  }, [activeTab, deleteRecordProp, isOwner]);

  const loadData = useCallback(async (pageNum = 1, isLoadMore = false, tab = activeTab) => {
    if ((isLoadMore && (tab === "transactions" ? loadingMoreTransactions : loadingMoreWithdrawals)) || 
        (!isLoadMore && dataLoading)) {
      console.log("Preventing duplicate API call");
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    console.log(`Loading ${tab} page ${pageNum}, isLoadMore: ${isLoadMore}`);
    
    if (isLoadMore) {
      if (tab === "transactions") {
        setLoadingMoreTransactions(true);
      } else {
        setLoadingMoreWithdrawals(true);
      }
    } else {
      setDataLoading(true);
    }

    setError(null);

    try {
      const signal = abortControllerRef.current.signal;
      const response = await axiosInstance.get("/finance/transactions/report/", {
        params: {
          page: pageNum,
          page_size: 10,
          report_type: tab === "withdrawals" ? "withdrawals" : "transactions"
        },
        signal
      });
      
      if (!isMountedRef.current) return;
      
      const data = response.data || {};
      const pagination = data.pagination || {};
      const dailyGroupsData = data.daily_groups || [];
      const withdrawalsData = data.withdrawals_by_date || [];
      const summaryData = data.summary || {};
      
      if (isLoadMore) {
        if (tab === "transactions") {
          setDailyGroups(prev => {
            const existingDates = new Set(prev.map(g => g.date));
            const filteredNewGroups = dailyGroupsData.filter(g => g && !existingDates.has(g.date));
            return [...prev, ...filteredNewGroups];
          });
          setTransactionsPage(pageNum);
          setHasMoreTransactions(pagination.has_next || false);
        } else if (tab === "withdrawals") {
          setWithdrawalsByDate(prev => {
            const existingDates = new Set(prev.map(w => w.date));
            const filteredNewWithdrawals = withdrawalsData.filter(w => w && !existingDates.has(w.date));
            return [...prev, ...filteredNewWithdrawals];
          });
          setWithdrawalsPage(pageNum);
          setHasMoreWithdrawals(pagination.has_next || false);
        }
      } else {
        if (tab === "transactions") {
          setDailyGroups(dailyGroupsData);
          setTransactionsPage(pageNum);
          setHasMoreTransactions(pagination.has_next || false);
          setTransactionsInitialized(true);
        } else if (tab === "withdrawals") {
          setWithdrawalsByDate(withdrawalsData);
          setWithdrawalsPage(pageNum);
          setHasMoreWithdrawals(pagination.has_next || false);
          setWithdrawalsInitialized(true);
        }
        
        if (summaryData) {
          setSummary(summaryData);
        }
      }
      
      console.log(`Successfully loaded ${tab} page ${pageNum}, hasMore: ${pagination.has_next}`);
      
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        console.log('Request was aborted');
        return;
      }
      
      if (!isMountedRef.current) return;
      
      console.error(`Failed to load ${tab}:`, err);
      setError(err.message || `Failed to load ${tab} data`);
      
      if (tab === "transactions") {
        setHasMoreTransactions(false);
      } else {
        setHasMoreWithdrawals(false);
      }
      
    } finally {
      if (isMountedRef.current) {
        if (isLoadMore) {
          if (tab === "transactions") {
            setLoadingMoreTransactions(false);
          } else {
            setLoadingMoreWithdrawals(false);
          }
        } else {
          setDataLoading(false);
        }
      }
    }
  }, [activeTab, dataLoading, loadingMoreTransactions, loadingMoreWithdrawals]);

  const handleLoadMore = useCallback(async () => {
    if (activeTab === "transactions") {
      if (hasMoreTransactions && !loadingMoreTransactions && transactionsInitialized) {
        await loadData(transactionsPage + 1, true, "transactions");
      }
    } else if (activeTab === "withdrawals") {
      if (hasMoreWithdrawals && !loadingMoreWithdrawals && withdrawalsInitialized) {
        await loadData(withdrawalsPage + 1, true, "withdrawals");
      }
    }
  }, [
    activeTab, 
    hasMoreTransactions, 
    hasMoreWithdrawals, 
    loadingMoreTransactions, 
    loadingMoreWithdrawals, 
    transactionsPage, 
    withdrawalsPage, 
    transactionsInitialized, 
    withdrawalsInitialized, 
    loadData
  ]);

  const handleTabChange = useCallback(async (tab) => {
    if (tab === activeTab) return;
    
    console.log(`Switching tab from ${activeTab} to ${tab}`);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setActiveTab(tab);
    setOpenDates({});
    setBusFilters({});
    setError(null);
    
    if ((tab === "transactions" && !transactionsInitialized) || 
        (tab === "withdrawals" && !withdrawalsInitialized)) {
      await loadData(1, false, tab);
    }
  }, [activeTab, transactionsInitialized, withdrawalsInitialized, loadData]);

  useEffect(() => {
    if (refreshTrigger > 0 && isMountedRef.current) {
      console.log("Refresh triggered from parent, reloading data...");
      refreshAllData();
    }
  }, [refreshTrigger]);

  const refreshAllData = useCallback(async () => {
    console.log("Refreshing all data...");
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setOpenDates({});
    setBusFilters({});
    setError(null);
    
    if (activeTab === "transactions") {
      setDailyGroups([]);
      setTransactionsPage(1);
      setHasMoreTransactions(true);
      setTransactionsInitialized(false);
    } else if (activeTab === "withdrawals") {
      setWithdrawalsByDate([]);
      setWithdrawalsPage(1);
      setHasMoreWithdrawals(true);
      setWithdrawalsInitialized(false);
    }
    
    await loadData(1, false, activeTab);
  }, [activeTab, loadData]);

  const handleManualRefresh = () => {
    refreshAllData();
  };

  useEffect(() => {
    if (isMountedRef.current && !transactionsInitialized) {
      loadData(1, false, "transactions");
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const {
    total_income = 0,
    total_expense = 0,
    total_maintenance = 0,
    total_withdrawal = 0,
    balance = 0,
  } = summary;

  if (loadingRecords || (dataLoading && activeTab === "transactions" && !transactionsInitialized)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Loading transactions...</p>
      </div>
    );
  }

  if (dataLoading && activeTab === "withdrawals" && !withdrawalsInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Loading withdrawals...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold text-gray-900">
          {activeTab === "transactions" ? "Daily Transactions" : "Owner Withdrawals"}
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={dataLoading || (activeTab === "transactions" ? loadingMoreTransactions : loadingMoreWithdrawals)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg text-gray-700 font-medium transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={18} className={dataLoading ? "animate-spin" : ""} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className={`grid grid-cols-2 ${isOwner ? "lg:grid-cols-4" : "sm:grid-cols-3"} gap-4`}>
          <SummaryCard label="Total Income" amount={total_income} bgColor="bg-gradient-to-br from-green-50 to-green-100" textColor="text-green-700" />
          <SummaryCard label="Regular Expense" amount={total_expense} bgColor="bg-gradient-to-br from-red-50 to-red-100" textColor="text-red-700" />
          <SummaryCard label="Maintenance" amount={total_maintenance} bgColor="bg-gradient-to-br from-orange-50 to-orange-100" textColor="text-orange-700" />
          {isOwner && <SummaryCard label="Owner Withdrawal" amount={total_withdrawal} bgColor="bg-gradient-to-br from-purple-50 to-purple-100" textColor="text-purple-700" />}
        </div>
        {isOwner && <WalletBalance balance={balance} />}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Failed to load data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={dataLoading}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 disabled:bg-red-50 disabled:cursor-not-allowed text-red-700 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("transactions")}
            disabled={dataLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all ${
              activeTab === "transactions" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100"
            } ${dataLoading ? "disabled:cursor-not-allowed" : ""}`}
          >
            <TrendingUp size={18} /> <span className="hidden sm:inline">Daily Transactions</span><span className="sm:hidden">Transactions</span>
          </button>
          {isOwner && (
            <button
              onClick={() => handleTabChange("withdrawals")}
              disabled={dataLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all ${
                activeTab === "withdrawals" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100"
              } ${dataLoading ? "disabled:cursor-not-allowed" : ""}`}
            >
              <Wallet size={18} /> Withdrawals
            </button>
          )}
        </div>
      </div>

      {activeTab === "transactions" && (
        <>
          {dailyGroups.length === 0 && !dataLoading && transactionsInitialized ? (
            <div className="text-center py-20">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium text-lg">No daily transactions found</p>
              <button
                onClick={handleManualRefresh}
                disabled={dataLoading}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {dailyGroups.map((group, index) => {
                  if (!group) return null;
                  
                  const isOpen = openDates[group.date];
                  const selectedBus = busFilters[group.date] || "";
                  const filteredBuses = selectedBus
                    ? (group.buses || []).filter(bus => bus?.bus_details?.bus_name === selectedBus)
                    : (group.buses || []);

                  const hasMultipleBuses = (group.buses || []).length > 1;
                  const netCollection = Number(group.day_totals?.net_collection || 0);

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
                            {group.date ? new Date(group.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }) : "Unknown Date"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Net</div>
                          <div className={`font-bold text-xl ${netCollection >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ₹{netCollection.toFixed(0)}
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
                                  <option value="">All Buses ({(group.buses || []).length})</option>
                                  {(group.buses || []).map(bus => (
                                    <option key={bus?.bus_details?.bus_name || `bus-${index}`} value={bus?.bus_details?.bus_name}>
                                      {bus?.bus_details?.bus_name || "Unnamed Bus"} {bus?.bus_details?.registration_number ? `(${bus.bus_details.registration_number})` : ""}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                              </div>
                            </div>
                          )}

                       {filteredBuses.map((bus, busIndex) => {
  // Optional: Log entire bus structure once (helpful for debugging grouping)
  console.log(`Bus: ${bus?.bus_details?.bus_name || "Unnamed"} (index ${busIndex})`, {
    bus_name: bus?.bus_details?.bus_name,
    staff: bus?.staff_assignments,
    income_count: bus?.income_transactions?.length || 0,
    expense_count: bus?.expense_maintenance_transactions?.length || 0,
    bus_attachments_count: bus?.attachments?.length || 0  // should be 0 or very few after fix
  });

  return (
    <div key={bus?.bus_details?.bus_name || `bus-${busIndex}`} className="space-y-4">
      <BusHeader busDetails={bus?.bus_details} />
      <BusSummary bus={bus} />
      <StaffBadgesRow assignments={bus?.staff_assignments} />

      {/* NO bus-level attachments button anymore */}

      <div className="space-y-4 divide-y divide-gray-200">
        {/* INCOME TRANSACTIONS */}
        {(bus?.income_transactions || []).map((rec) => {
          // Log full transaction data (including attachments!)
          console.log(`Income Transaction ID: ${rec.id}`, {
            id: rec.id,
            date: rec.date,
            total_amount: rec.total_amount,
            category_name: rec.category_name,
            transaction_type: rec.transaction_type,
            description: rec.description?.substring(0, 100) + (rec.description?.length > 100 ? '...' : ''),
            bus_name: rec.bus_name,
            created_at: rec.created_at,
            attachments: rec.attachments || [],                  // ← THIS is what we want to see!
            attachments_count: rec.attachments?.length || 0,
            items: rec.items?.map(i => ({
              category: i.category_name,
              amount: i.amount
            })) || []
          });

          return (
            <div key={rec.id} className="pt-4 first:pt-0">
              <TransactionItem 
  record={rec}
  isOwner={isOwner}
  onDelete={handleDeleteRecord}
  onOpenAttachments={openAttachmentsModal}
/>

        
{/* {rec.attachments?.length > 0 && (
  <div className="px-2 py-1 border-t border-gray-100 bg-gray-50 flex justify-start">
    <button
      onClick={(e) => {
        e.stopPropagation();
        openAttachmentsModal(
          `Attachments - ${rec.bus_name || "Unknown"}`,
          rec.attachments
        );
      }}
      className="flex items-center gap-2 px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded-lg"
    >
      Attachments ({rec.attachments.length})
    </button>
  </div>
)} */}


            </div>
          );
        })}

        {/* EXPENSE & MAINTENANCE TRANSACTIONS */}
        {(bus?.expense_maintenance_transactions || []).map((rec) => {
          // Same log for expense/maintenance
          console.log(`Expense/Maint Transaction ID: ${rec.id}`, {
            id: rec.id,
            date: rec.date,
            total_amount: rec.total_amount,
            category_name: rec.category_name,
            transaction_type: rec.transaction_type,
            description: rec.description?.substring(0, 100) + (rec.description?.length > 100 ? '...' : ''),
            bus_name: rec.bus_name,
            created_at: rec.created_at,
            attachments: rec.attachments || [],
            attachments_count: rec.attachments?.length || 0,
            items: rec.items?.map(i => ({
              category: i.category_name,
              amount: i.amount
            })) || []
          });

          return (
            <div key={rec.id} className="pt-4 first:pt-0">
              <TransactionItem 
                record={rec} 
                isOwner={isOwner} 
                onDelete={handleDeleteRecord} 
              />
              {rec.attachments?.length > 0 && (
                <div className="mt-2 pl-4">
                  <AttachmentsButton
                    attachments={rec.attachments}
                    busName={bus?.bus_details?.bus_name}
                    onOpenModal={openAttachmentsModal}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
})}

                          {filteredBuses.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No transactions for the selected bus filter.
                            </div>
                          )}

                          <div className="flex justify-end pt-4">
                            <DailyReportDownloadButton date={group.date} buses={group.buses || []} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <LoadMoreButton
                loading={loadingMoreTransactions}
                hasMore={hasMoreTransactions}
                onClick={handleLoadMore}
                label="Load More Transactions"
              />
              
              {!hasMoreTransactions && dailyGroups.length > 0 && !loadingMoreTransactions && (
                <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-6">
                  No more transactions to load
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === "withdrawals" && isOwner && (
        withdrawalsByDate.length === 0 && !dataLoading && withdrawalsInitialized ? (
          <div className="text-center py-20">
            <Wallet className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium text-lg">No withdrawals found</p>
            <button
              onClick={handleManualRefresh}
              disabled={dataLoading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
            >
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {withdrawalsByDate.map((wd, index) => {
                if (!wd) return null;
                
                const isOpen = openDates[wd.date];
                const total = Number(wd.total || 0);
                
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
                          {wd.date ? new Date(wd.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          }) : "Unknown Date"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="font-bold text-xl text-purple-700">-₹{total.toFixed(0)}</div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="p-4 space-y-3 bg-gray-50">
                        {(wd.transactions || []).map(rec => (
                          <TransactionItem 
                            key={rec.id} 
                            record={rec} 
                            isOwner={isOwner} 
                            onDelete={handleDeleteRecord} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <LoadMoreButton
              loading={loadingMoreWithdrawals}
              hasMore={hasMoreWithdrawals}
              onClick={handleLoadMore}
              label="Load More Withdrawals"
            />
            
            {!hasMoreWithdrawals && withdrawalsByDate.length > 0 && !loadingMoreWithdrawals && (
              <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-6">
                No more withdrawals to load
              </div>
            )}
          </>
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
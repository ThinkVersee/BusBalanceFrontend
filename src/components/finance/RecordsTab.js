"use client";

import React, { useState } from "react";
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
  Filter,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                          TRANSACTION TYPE CONFIG                           */
/* -------------------------------------------------------------------------- */
const TRANSACTION_CONFIG = {
  INCOME: {
    label: "IN",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    amountColor: "text-emerald-600",
  },
  MAINTENANCE: {
    label: "MNT",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    amountColor: "text-red-600",
  },
  WITHDRAWAL: {
    label: "WD",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    amountColor: "text-purple-600",
  },
  EXPENSE: {
    label: "EXP",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
    amountColor: "text-red-600",
  },
};

/* -------------------------------------------------------------------------- */
/*                               TRANSACTION ITEM                             */
/* -------------------------------------------------------------------------- */
const TransactionItem = ({ record, isOwner, onDelete }) => {
  const config = TRANSACTION_CONFIG[record.transaction_type] || TRANSACTION_CONFIG.EXPENSE;
  const displayName = record.bus_name || 
    (record.transaction_type === "WITHDRAWAL" ? "Owner Wallet" : "No bus");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4   transition-all duration-200 hover:border-gray-300">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex-shrink-0 ${config.bgColor} ${config.textColor}  `}>
            {config.label}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 text-sm sm:text-base mb-0.5 sm:mb-1 truncate">
              {record.category_name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              {displayName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-right">
            <span className={`font-bold text-base sm:text-xl whitespace-nowrap ${config.amountColor}`}>
              ₹{Number(record.amount).toLocaleString('en-IN')}
            </span>
          </div>

          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record.id);
              }}
              className="p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 border border-transparent hover:border-red-200"
              aria-label="Delete transaction"
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SUMMARY CARD                                  */
/* -------------------------------------------------------------------------- */
const SummaryCard = ({ label, amount, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center  border border-gray-200   transition-shadow`}>
    <div className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${textColor} mb-1 sm:mb-2`}>{label}</div>
    <div className={`text-xl sm:text-3xl font-bold ${textColor}`}>
      ₹{Number(amount).toLocaleString('en-IN')}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                             WALLET BALANCE                                 */
/* -------------------------------------------------------------------------- */
const WalletBalance = ({ balance }) => {
  const isPositive = balance >= 0;
  const displayAmount = Math.abs(balance).toLocaleString('en-IN');

  return (
    <div
      className={`mt-4 sm:mt-6 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 text-center   ${
        isPositive
          ? "bg-gradient-to-br from-emerald-50 via-emerald-100 to-green-100 border-emerald-300"
          : "bg-gradient-to-br from-rose-50 via-red-100 to-red-100 border-red-300"
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
        <Wallet className={isPositive ? "text-emerald-700" : "text-red-700"} size={20} />
        <div className={`text-base sm:text-lg font-bold uppercase tracking-wide ${isPositive ? "text-emerald-800" : "text-red-800"}`}>
          Wallet Balance
        </div>
      </div>
      <div className={`text-3xl sm:text-5xl font-extrabold mb-2 ${isPositive ? "text-emerald-700" : "text-red-700"}`}>
        {isPositive ? "+" : "-"}₹{displayAmount}
      </div>
      <div className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
        isPositive 
          ? "bg-emerald-200 text-emerald-800" 
          : "bg-red-200 text-red-800"
      }`}>
        {isPositive ? "✓ Available funds" : "⚠ Outstanding amount"}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           DAILY SUMMARY HEADER                             */
/* -------------------------------------------------------------------------- */
const DailySummaryHeader = ({ date, netCollection, isOpen, onToggle, recordCount }) => (
  <div
    className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border-b-2 border-blue-200"
    onClick={onToggle}
  >
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className={`p-1.5 sm:p-2 rounded-lg transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-0 bg-blue-200' : 'bg-blue-100'}`}>
          {isOpen ? <ChevronDown size={18} className="text-blue-700 sm:w-5 sm:h-5" /> : <ChevronRight size={18} className="text-blue-600 sm:w-5 sm:h-5" />}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Calendar size={16} className="text-blue-600 flex-shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-xs sm:text-base truncate">
              {new Date(date).toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
              {recordCount} {recordCount === 1 ? 'transaction' : 'transactions'}
            </div>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-0.5 sm:mb-1 uppercase tracking-wide">Net</div>
        <div className={`font-extrabold text-base sm:text-2xl ${netCollection >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {netCollection >= 0 ? '+' : '-'}₹{Math.abs(netCollection).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                      WITHDRAWAL DATE HEADER                                */
/* -------------------------------------------------------------------------- */
const WithdrawalDateHeader = ({ date, totalAmount, isOpen, onToggle, recordCount }) => (
  <div
    className="px-3 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border-b-2 border-blue-200"
    onClick={onToggle}
  >
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className={`p-1.5 sm:p-2 rounded-lg transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-0 bg-blue-200' : 'bg-blue-100'}`}>
          {isOpen ? <ChevronDown size={18} className="text-blue-700 sm:w-5 sm:h-5" /> : <ChevronRight size={18} className="text-blue-600 sm:w-5 sm:h-5" />}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Wallet size={16} className="text-blue-600 flex-shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-xs sm:text-base truncate">
              {new Date(date).toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
              {recordCount} {recordCount === 1 ? 'withdrawal' : 'withdrawals'}
            </div>
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="text-[10px] sm:text-xs text-blue-600 font-semibold mb-0.5 sm:mb-1 uppercase tracking-wide">Total</div>
        <div className="font-extrabold text-base sm:text-2xl text-blue-700">
          -₹{totalAmount.toLocaleString('en-IN')}
        </div>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full   max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto">
            {attachments.map((attachment, index) => (
              <a
                key={attachment.id || index}
                href={attachment.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/\.(jpe?g|png|gif|webp)$/i.test(attachment.file_name) ? (
                  <img src={attachment.file_url} alt="" className="w-10 h-10 rounded object-cover border" />
                ) : (
                  <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">PDF</span>
                  </div>
                )}
                <span className="flex-1 text-sm font-medium truncate">{attachment.file_name}</span>
              </a>
            ))}
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
  records = [],
  loadingRecords = false,
  summary = {},
  openDates = {},
  toggleDate,
  deleteRecord,
  isOwner = false,
  modalOpen = false,
  setModalOpen,
  modalTitle = "",
  modalAttachments = [],
}) {
  const [activeTab, setActiveTab] = useState("transactions");
  const [dateBusFilters, setDateBusFilters] = useState({});

  const {
    total_income = 0,
    total_expense = 0,
    total_maintenance = 0,
    total_withdrawal = 0,
    balance = 0,
  } = summary;

  /* ------------------------------ GROUP RECORDS ----------------------------- */
  const regularTransactions = records.filter(r => r.transaction_type !== "WITHDRAWAL");
  const withdrawalTransactions = records.filter(r => r.transaction_type === "WITHDRAWAL");

  const regularRecordsByDate = regularTransactions.reduce((acc, record) => {
    const dateKey = record.date || "unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const withdrawalsByDate = withdrawalTransactions.reduce((acc, record) => {
    const dateKey = record.date || "unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const regularDates = Object.keys(regularRecordsByDate).sort((a, b) => new Date(b) - new Date(a));
  const withdrawalDates = Object.keys(withdrawalsByDate).sort((a, b) => new Date(b) - new Date(a));

  /* ------------------------- DAILY NET CALCULATION ----------------------- */
  const calculateDailyNet = (dayRecords) => {
    let income = 0, outflow = 0;
    dayRecords.forEach(r => {
      const amt = Number(r.amount || 0);
      if (r.transaction_type === "INCOME") income += amt;
      else outflow += amt;
    });
    return income - outflow;
  };

  /* ------------------------- UNIQUE BUS NAMES FOR A DATE ----------------------- */
  const getUniqueBusNamesForDate = (date) => {
    const dayRecords = regularRecordsByDate[date] || [];
    const busNames = new Set();
    dayRecords.forEach(record => {
      const name = record.bus_name?.trim();
      if (name) busNames.add(name);
    });
    return Array.from(busNames).sort();
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      {/* SUMMARY SECTION */}
      <div className="bg-white rounded-xl sm:rounded-xl   p-3 sm:p-6 mb-3 sm:mb-6 border border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <SummaryCard 
            label="Total Income" 
            amount={total_income} 
            bgColor="bg-gradient-to-br from-emerald-50 to-green-100" 
            textColor="text-emerald-700"
          />
          <SummaryCard 
            label="Regular Expense" 
            amount={total_expense} 
            bgColor="bg-gradient-to-br from-rose-50 to-red-100" 
            textColor="text-rose-700"
          />
          <SummaryCard 
            label="Maintenance" 
            amount={total_maintenance} 
            bgColor="bg-gradient-to-br from-amber-50 to-orange-100" 
            textColor="text-amber-700"
          />
          <SummaryCard 
            label="Owner Withdrawal" 
            amount={total_withdrawal} 
            bgColor="bg-gradient-to-br from-purple-50 to-violet-100" 
            textColor="text-purple-700"
          />
        </div>
        <WalletBalance balance={balance} />
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl sm:rounded-xl   p-1.5 sm:p-2 mb-3 sm:mb-6 border border-gray-200">
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base transition-all duration-200 ${
              activeTab === "transactions" 
                ? "  bg-blue-600   text-white  " 
                : "bg-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Daily Transactions</span>
            <span className="sm:hidden">Transactions</span>
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-bold text-xs sm:text-base transition-all duration-200 ${
              activeTab === "withdrawals" 
                ? "bg-blue-600   text-white   " 
                : "bg-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Wallet size={16} className="sm:w-5 sm:h-5" />
            Withdrawals
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loadingRecords ? (
        <div className="flex flex-col items-center justify-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-3xl ">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading records...</p>
        </div>
      ) : (
        <>
          {/* DAILY TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <>
              {regularDates.length === 0 ? (
                <div className="text-center py-20 sm:py-32 bg-white rounded-xl sm:rounded-xl  border border-gray-200">
                  <FileText className="mx-auto text-gray-300 mb-4" size={56} />
                  <p className="text-gray-500 font-semibold text-lg sm:text-xl mb-2 px-4">No transactions yet</p>
                  <p className="text-gray-400 text-xs sm:text-sm px-4">Daily transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-6">
                  {regularDates.map((date) => {
                    const allDayRecords = regularRecordsByDate[date] || [];
                    const netCollection = calculateDailyNet(allDayRecords);
                    const isOpen = openDates[date];
                    const selectedBusName = dateBusFilters[date] || "";
                    const filteredRecords = selectedBusName
                      ? allDayRecords.filter(r => (r.bus_name?.trim() || "") === selectedBusName)
                      : allDayRecords;
                    const busNamesOnDate = getUniqueBusNamesForDate(date);

                    return (
                      <div key={date} className="bg-white rounded-xl sm:rounded-xl   overflow-hidden border border-gray-200  transition-shadow">
                        <DailySummaryHeader
                          date={date}
                          netCollection={netCollection}
                          isOpen={isOpen}
                          onToggle={() => toggleDate(date)}
                          recordCount={allDayRecords.length}
                        />

                        {isOpen && (
                          <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-br from-gray-50 to-white">
                            {busNamesOnDate.length > 1 && (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 border border-blue-50 rounded-xl">
                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                  <Filter size={18} className="text-blue-600 flex-shrink-0 sm:w-5 sm:h-5" />
                                  <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by Bus:</span>
                                </div>
                                <div className="relative flex-1 w-full">
                                  <select
                                    value={selectedBusName}
                                    onChange={(e) =>
                                      setDateBusFilters(prev => ({
                                        ...prev,
                                        [date]: e.target.value,
                                      }))
                                    }
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 bg-white border-2 border-blue-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none "
                                  >
                                    <option value="">All Buses ({allDayRecords.length})</option>
                                    {busNamesOnDate.map((name) => {
                                      const count = allDayRecords.filter(r => r.bus_name?.trim() === name).length;
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
                                        setDateBusFilters(prev => ({
                                          ...prev,
                                          [date]: "",
                                        }))
                                      }
                                      className="absolute right-9 sm:right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                                    >
                                      <X size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                  )}
                                  <ChevronDown size={16} className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none sm:w-[18px] sm:h-[18px]" />
                                </div>
                              </div>
                            )}

                            {filteredRecords.length === 0 ? (
                              <p className="text-center text-gray-500 py-8 sm:py-12 font-medium text-sm sm:text-base">
                                No transactions found
                              </p>
                            ) : (
                              <div className="space-y-2 sm:space-y-3">
                                {filteredRecords.map((record) => (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === "withdrawals" && (
            <>
              {withdrawalDates.length === 0 ? (
                <div className="text-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-3xl   border border-gray-200">
                  <Wallet className="mx-auto text-gray-300 mb-4" size={56} />
                  <p className="text-gray-500 font-semibold text-lg sm:text-xl mb-2 px-4">No withdrawals found</p>
                  <p className="text-gray-400 text-xs sm:text-sm px-4">Withdrawal history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-6">
                  {withdrawalDates.map((date) => {
                    const dailyWithdrawals = withdrawalsByDate[date] || [];
                    const isOpen = openDates[date];
                    const total = dailyWithdrawals.reduce((sum, r) => sum + Number(r.amount || 0), 0);

                    return (
                      <div key={date} className="bg-white rounded-xl sm:rounded-2xl   overflow-hidden border border-gray-200   transition-shadow">
                        <WithdrawalDateHeader 
                          date={date} 
                          totalAmount={total} 
                          isOpen={isOpen} 
                          onToggle={() => toggleDate(date)}
                          recordCount={dailyWithdrawals.length}
                        />
                        {isOpen && (
                          <div className="p-3 sm:p-6 space-y-2 sm:space-y-3 bg-gradient-to-br from-purple-50/30 to-violet-50/30">
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
    </>
  );
}
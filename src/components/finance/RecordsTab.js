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
  User,
} from "lucide-react";

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
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          iconColor: "text-blue-600",
          label: "Driver",
        };
      case "CONDUCTOR":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          iconColor: "text-green-600",
          label: "Conductor",
        };
      case "CLEANER":
        return {
          bgColor: "bg-orange-100",
          textColor: "text-orange-700",
          iconColor: "text-orange-600",
          label: "Cleaner",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "text-gray-600",
          label: "Staff",
        };
    }
  };

  const config = getConfig(role);

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <User size={12} className={config.iconColor} />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}: {name}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               TRANSACTION ITEM                             */
/* -------------------------------------------------------------------------- */
const TransactionItem = ({ record, isOwner, onDelete }) => {
  const config = TRANSACTION_CONFIG[record.transaction_type] || TRANSACTION_CONFIG.EXPENSE;
  const displayName = record.bus_name || 
    (record.transaction_type === "WITHDRAWAL" ? "Owner Wallet" : "No bus");

  return (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </span>

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {record.category_name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {displayName}
          </div>
          {/* Staff names removed from individual transactions */}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`font-bold text-lg whitespace-nowrap ${config.amountColor}`}>
          ₹{Number(record.amount).toFixed(0)}
        </span>

        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete transaction"
          >
            <Trash2 size={18} />
          </button>
        )}
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
      className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {isImage ? (
        <img
          src={attachment.file_url}
          alt={attachment.file_name}
          className="w-10 h-10 rounded object-cover border border-gray-200"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-xs font-bold text-red-600">PDF</span>
        </div>
      )}
      <span className="flex-1 text-sm font-medium truncate">
        {attachment.file_name}
      </span>
    </a>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SUMMARY CARD                                  */
/* -------------------------------------------------------------------------- */
const SummaryCard = ({ label, amount, bgColor, textColor }) => (
  <div className={`${bgColor} rounded-xl p-4 text-center`}>
    <div className={`text-sm font-medium ${textColor}`}>{label}</div>
    <div className={`text-2xl font-bold ${textColor}`}>
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
      className={`mt-5 rounded-xl p-5 border-2 text-center ${
        isPositive
          ? "bg-gradient-to-br from-green-50 to-green-100 border-green-300"
          : "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
      }`}
    >
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

/* -------------------------------------------------------------------------- */
/*                           DAILY SUMMARY HEADER                             */
/* -------------------------------------------------------------------------- */
const DailySummaryHeader = ({ date, netCollection, isOpen, onToggle, staffAssignments }) => (
  <div
    className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-colors"
    onClick={onToggle}
  >
    <div className="flex-1 flex items-center gap-3">
      {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      <Calendar size={18} className="text-blue-600" />
      <div className="flex-1">
        <div className="font-bold text-gray-900">
          {new Date(date).toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
        
        {/* Staff Summary - Clean full labels */}
        {(staffAssignments.driver || staffAssignments.conductor || staffAssignments.cleaner) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {staffAssignments.driver && (
              <StaffBadge role="DRIVER" name={staffAssignments.driver} />
            )}
            {staffAssignments.conductor && (
              <StaffBadge role="CONDUCTOR" name={staffAssignments.conductor} />
            )}
            {staffAssignments.cleaner && (
              <StaffBadge role="CLEANER" name={staffAssignments.cleaner} />
            )}
          </div>
        )}
      </div>
    </div>

    <div className="text-right">
      <div className="text-xs text-gray-500 font-medium">Daily Net Collection</div>
      <div className={`font-bold text-xl ${netCollection >= 0 ? "text-green-600" : "text-red-600"}`}>
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
    className="px-4 py-4 bg-gradient-to-r from-purple-50 to-purple-100 flex items-center justify-between cursor-pointer hover:from-purple-100 hover:to-purple-200 transition-colors"
    onClick={onToggle}
  >
    <div className="flex items-center gap-3">
      {isOpen ? <ChevronDown size={20} className="text-purple-700" /> : <ChevronRight size={20} className="text-purple-700" />}
      <Calendar size={18} className="text-purple-600" />
      <div className="font-bold text-gray-900">
        {new Date(date).toLocaleDateString("en-IN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>

    <div className="text-right">
      <div className="text-xs text-purple-600 font-medium">Total Withdrawal</div>
      <div className="font-bold text-xl text-purple-700">
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
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {attachments.map((attachment, index) => (
              <AttachmentItem
                key={attachment.id || index}
                attachment={attachment}
              />
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
  records,
  loadingRecords,
  filterBus,
  summary = {},
  openDates,
  toggleDate,
  deleteRecord,
  isOwner,
  modalOpen,
  setModalOpen,
  modalTitle,
  modalAttachments,
}) {
  const [activeTab, setActiveTab] = useState("transactions");

  const {
    total_income = 0,
    total_expense = 0,
    total_maintenance = 0,
    total_withdrawal = 0,
    balance = 0,
  } = summary;

  /* ------------------------------ FILTER & GROUP LOGIC ----------------------------- */
  const regularTransactions = records.filter(
    (record) => record.transaction_type !== "WITHDRAWAL"
  );
  
  const withdrawalTransactions = records.filter(
    (record) => record.transaction_type === "WITHDRAWAL"
  );

  const filteredRegularTransactions = filterBus
    ? regularTransactions.filter(
        (record) => String(record.bus?.id || record.bus_id || "") === String(filterBus)
      )
    : regularTransactions;

  const regularRecordsByDate = filteredRegularTransactions.reduce((grouped, record) => {
    const dateKey = record.date || "unknown";
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
    return grouped;
  }, {});

  const withdrawalsByDate = withdrawalTransactions.reduce((grouped, record) => {
    const dateKey = record.date || "unknown";
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
    return grouped;
  }, {});

  const regularDates = Object.keys(regularRecordsByDate).sort(
    (dateA, dateB) => new Date(dateB) - new Date(dateA)
  );

  const withdrawalDates = Object.keys(withdrawalsByDate).sort(
    (dateA, dateB) => new Date(dateB) - new Date(dateA)
  );

  /* ------------------------- CALCULATE DAILY TOTALS ----------------------- */
  const calculateDailyTotals = (dayRecords) => {
    const totals = {
      incomes: [],
      expenses: [],
      maintenances: [],
      totalIncome: 0,
      totalExpense: 0,
      totalMaintenance: 0,
      staffAssignments: {
        driver: "",
        conductor: "",
        cleaner: ""
      }
    };

    dayRecords.forEach((record) => {
      const amount = Number(record.amount || 0);
      
      switch (record.transaction_type) {
        case "INCOME":
          totals.incomes.push(record);
          totals.totalIncome += amount;
          break;
        case "EXPENSE":
          totals.expenses.push(record);
          totals.totalExpense += amount;
          break;
        case "MAINTENANCE":
          totals.maintenances.push(record);
          totals.totalMaintenance += amount;
          break;
      }

      // Take staff names from the first record that has them
      if (record.staff_names && !totals.staffAssignments.driver) {
        totals.staffAssignments.driver = record.staff_names.driver || "";
      }
      if (record.staff_names && !totals.staffAssignments.conductor) {
        totals.staffAssignments.conductor = record.staff_names.conductor || "";
      }
      if (record.staff_names && !totals.staffAssignments.cleaner) {
        totals.staffAssignments.cleaner = record.staff_names.cleaner || "";
      }
    });

    totals.netCollection = totals.totalIncome - (totals.totalExpense + totals.totalMaintenance);
    return totals;
  };

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      {/* SUMMARY SECTION */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Income"
            amount={total_income}
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
            textColor="text-green-700"
          />
          <SummaryCard
            label="Regular Expense"
            amount={total_expense}
            bgColor="bg-gradient-to-br from-red-50 to-red-100"
            textColor="text-red-700"
          />
          <SummaryCard
            label="Maintenance"
            amount={total_maintenance}
            bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
            textColor="text-orange-700"
          />
          <SummaryCard
            label="Owner Withdrawal"
            amount={total_withdrawal}
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
            textColor="text-purple-700"
          />
        </div>

        <WalletBalance balance={balance} />
      </div>

      {/* TABS */}
      <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "transactions"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp size={20} />
            Daily Transactions
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              activeTab === "withdrawals"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Wallet size={20} />
            Withdrawals
          </button>
        </div>
      </div>

      {/* CONTENT BASED ON ACTIVE TAB */}
      {loadingRecords ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : (
        <>
          {/* DAILY TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <>
              {regularDates.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 font-medium text-lg">No daily transactions found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Start by adding income or expenses
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {regularDates.map((date) => {
                    const dailyRegularRecords = regularRecordsByDate[date] || [];
                    const dailyTotals = calculateDailyTotals(dailyRegularRecords);
                    const isDateOpen = openDates[date];

                    return (
                      <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <DailySummaryHeader
                          date={date}
                          netCollection={dailyTotals.netCollection}
                          isOpen={isDateOpen}
                          onToggle={() => toggleDate(date)}
                          staffAssignments={dailyTotals.staffAssignments}
                        />

                        {isDateOpen && (
                          <div className="p-4 space-y-3">
                            {/* Income Transactions */}
                            {dailyTotals.incomes.map((record) => (
                              <TransactionItem
                                key={record.id}
                                record={record}
                                isOwner={isOwner}
                                onDelete={deleteRecord}
                              />
                            ))}

                            {/* Expense & Maintenance Transactions */}
                            {[...dailyTotals.expenses, ...dailyTotals.maintenances].map((record) => (
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

          {/* WITHDRAWALS TAB */}
          {activeTab === "withdrawals" && (
            <>
              {withdrawalDates.length === 0 ? (
                <div className="text-center py-20">
                  <Wallet className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 font-medium text-lg">No withdrawals found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Owner withdrawals will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {withdrawalDates.map((date) => {
                    const dailyWithdrawals = withdrawalsByDate[date] || [];
                    const isDateOpen = openDates[date];
                    
                    const withdrawalTotal = dailyWithdrawals.reduce(
                      (sum, record) => sum + Number(record.amount || 0),
                      0
                    );

                    return (
                      <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <WithdrawalDateHeader
                          date={date}
                          totalAmount={withdrawalTotal}
                          isOpen={isDateOpen}
                          onToggle={() => toggleDate(date)}
                        />

                        {isDateOpen && (
                          <div className="p-4 space-y-3 bg-gradient-to-br from-purple-50/30 to-purple-100/30">
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

      {/* ATTACHMENTS MODAL */}
      <AttachmentsModal
        isOpen={modalOpen}
        title={modalTitle}
        attachments={modalAttachments}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
// components/finance/RecordsTab.js
"use client";

import React from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Trash2,
  Loader2,
  FileText,
  X,
  ArrowDownCircle,
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
        ₹{displayAmount}
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
const DailySummaryHeader = ({ date, netCollection, isOpen, onToggle }) => (
  <div
    className="px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-colors"
    onClick={onToggle}
  >
    <div className="flex items-center gap-3">
      {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      <Calendar size={18} className="text-blue-600" />
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
      <div className="text-xs text-gray-500 font-medium">Daily Net Collection</div>
      <div className={`font-bold text-xl ${netCollection >= 0 ? "text-green-600" : "text-red-600"}`}>
        ₹{netCollection.toFixed(0)}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                           WITHDRAWAL SECTION                               */
/* -------------------------------------------------------------------------- */
const WithdrawalSection = ({ withdrawals, totalAmount, isOwner, onDelete }) => (
  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-4 shadow-sm">
    <div className="flex items-center gap-3 font-bold text-purple-800 mb-3">
      <ArrowDownCircle size={22} />
      <span>Owner Withdrawal</span>
      <span className="ml-auto text-xl">-₹{totalAmount.toFixed(0)}</span>
    </div>

    <div className="space-y-3">
      {withdrawals.map((record) => (
        <TransactionItem
          key={record.id}
          record={record}
          isOwner={isOwner}
          onDelete={onDelete}
        />
      ))}
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
  const {
    total_income = 0,
    total_expense = 0,
    total_maintenance = 0,
    total_withdrawal = 0,
    balance = 0,
  } = summary;

  /* ------------------------------ FILTER LOGIC ----------------------------- */
  const filteredRecords = filterBus
    ? records.filter(
        (record) =>
          String(record.bus?.id || record.bus_id || "") === String(filterBus) &&
          record.transaction_type !== "WITHDRAWAL"
      )
    : records;

  /* ------------------------- GROUP BY DATE LOGIC -------------------------- */
  const recordsByDate = filteredRecords.reduce((grouped, record) => {
    const dateKey = record.date || "unknown";
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(record);
    return grouped;
  }, {});

  const sortedDates = Object.keys(recordsByDate).sort(
    (dateA, dateB) => new Date(dateB) - new Date(dateA)
  );

  /* ------------------------- CALCULATE DAILY TOTALS ----------------------- */
  const calculateDailyTotals = (dayRecords) => {
    const totals = {
      incomes: [],
      expenses: [],
      maintenances: [],
      withdrawals: [],
      totalIncome: 0,
      totalExpense: 0,
      totalMaintenance: 0,
      totalWithdrawal: 0,
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
        case "WITHDRAWAL":
          totals.withdrawals.push(record);
          totals.totalWithdrawal += amount;
          break;
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

      {/* RECORDS SECTION */}
      {loadingRecords ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 font-medium text-lg">No records found</p>
          <p className="text-gray-400 text-sm mt-2">
            Start by adding your first transaction
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const dailyTotals = calculateDailyTotals(recordsByDate[date]);
            const isDateOpen = openDates[date];

            return (
              <div key={date} className="space-y-4">
                {/* DAILY TRANSACTIONS CARD */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <DailySummaryHeader
                    date={date}
                    netCollection={dailyTotals.netCollection}
                    isOpen={isDateOpen}
                    onToggle={() => toggleDate(date)}
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

                {/* WITHDRAWAL SECTION */}
                {dailyTotals.withdrawals.length > 0 && (
                  <WithdrawalSection
                    withdrawals={dailyTotals.withdrawals}
                    totalAmount={dailyTotals.totalWithdrawal}
                    isOwner={isOwner}
                    onDelete={deleteRecord}
                  />
                )}
              </div>
            );
          })}
        </div>
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
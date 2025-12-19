// components/finance/RecordsTab.js
"use client";

import React from "react";
import {
    Filter,
    Calendar,
    ChevronDown,
    ChevronRight,
    FolderOpen,
    IndianRupee,
    Trash2,
    Loader2,
    FileText,
    X,
    TrendingUp,
    TrendingDown,
    Wrench,
} from "lucide-react";

const TransactionItem = ({ r, isOwner, deleteRecord }) => (
    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${r.transaction_type === "INCOME"
                    ? "bg-green-100 text-green-700"
                    : r.transaction_type === "MAINTENANCE"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
            >
                {r.transaction_type === "INCOME" ? "IN" : r.transaction_type === "MAINTENANCE" ? "MNT" : "EXP"}
            </span>
            <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 text-sm truncate">
                    {r.category_name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                    {r.bus_name || "No bus"}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <span
                className={`font-bold text-lg whitespace-nowrap ${r.transaction_type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}
            >
                ₹{parseFloat(r.amount).toFixed(0)}
            </span>

            {isOwner && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteRecord(r.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    </div>
);

const AttachmentItemGoogle = ({ attachment }) => {
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
                <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-red-600">PDF</span>
                </div>
            )}
            <span className="flex-1 text-sm font-medium truncate">
                {attachment.file_name}
            </span>
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
};

export default function RecordsTab({
    ownedBuses,
    records,
    loadingRecords,
    filterDate,
    setFilterDate,
    filterBus,
    setFilterBus,
    grandIncome,
    grandExpense,
    grandBalance,
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
    expenseCategories = [],
    incomeCategories = [],
}) {
    // Filter by bus first
    const filteredRecords = filterBus
        ? records.filter(r => String(r.bus?.id || r.bus_id || "") === String(filterBus))
        : records;

    // Group by date
    const recordsByDate = Array.isArray(filteredRecords)
        ? filteredRecords.reduce((acc, r) => {
            const dateKey = r.date || "unknown";
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(r);
            return acc;
        }, {})
        : {};

    const filteredDates = Object.keys(recordsByDate)
        .filter((d) => !filterDate || d === filterDate)
        .sort((a, b) => new Date(b) - new Date(a));

    return (
        <>
            {/* FILTERS */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-5">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={18} className="text-gray-600" />
                    <h2 className="font-semibold text-gray-800">Filters</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <select
                        value={filterBus}
                        onChange={(e) => setFilterBus(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">All Buses</option>
                        {ownedBuses.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.bus_name}
                            </option>
                        ))}
                    </select>
                </div>
                {(filterDate || filterBus) && (
                    <button
                        onClick={() => {
                            setFilterDate("");
                            setFilterBus("");
                        }}
                        className="mt-3 w-full py-2.5 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* SUMMARY */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                        <IndianRupee size={20} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Summary</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-100 text-center">
                        <div className="text-xs sm:text-sm font-medium text-green-700">Total Income</div>
                        <div className="text-xl sm:text-2xl font-bold text-green-700 mt-1">
                            ₹{grandIncome.toFixed(0)}
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-xl p-3 sm:p-4 border border-red-100 text-center">
                        <div className="text-xs sm:text-sm font-medium text-red-700">Total Expense (incl. Maintenance)</div>
                        <div className="text-xl sm:text-2xl font-bold text-red-700 mt-1">
                            ₹{grandExpense.toFixed(0)}
                        </div>
                    </div>

                    <div className={`rounded-xl p-3 sm:p-4 border text-center ${grandBalance >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                        <div className={`text-xs sm:text-sm font-medium ${grandBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
                            Net Balance
                        </div>
                        <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${grandBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {grandBalance >= 0 ? "₹" : "-₹"}
                            {Math.abs(grandBalance).toFixed(0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* RECORDS LIST */}
            {loadingRecords ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={48} />
                </div>
            ) : filteredDates.length === 0 ? (
                <div className="text-center py-20">
                    <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 font-medium text-lg">No records found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting filters or add new entries</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDates.map((date) => {
                        const dayRecords = recordsByDate[date] || [];
                        const allAttachments = dayRecords.flatMap((r) => r.attachments || []);
                        const isOpen = openDates[date];

                        const incomes = dayRecords.filter(r => r.transaction_type === "INCOME");
                        const expenses = dayRecords.filter(r => r.transaction_type === "EXPENSE");
                        const maintenances = dayRecords.filter(r => r.transaction_type === "MAINTENANCE");

                        const sortByCreationTime = (a, b) => {
                            const dateA = new Date(a.owner_category?.created || a.created_at || 0);
                            const dateB = new Date(b.owner_category?.created || b.created_at || 0);
                            return dateA - dateB;
                        };

                        const sortedIncomes       = [...incomes].sort(sortByCreationTime);
                        const sortedExpenses      = [...expenses].sort(sortByCreationTime);
                        const sortedMaintenances  = [...maintenances].sort(sortByCreationTime);

                        const dayIncome = incomes.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
                        const dayRegularExpense = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
                        const dayMaintenance = maintenances.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
                        const dayTotalExpense = dayRegularExpense + dayMaintenance; // Includes maintenance
                        const dayBalance = dayIncome - dayTotalExpense;

                        return (
                            <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {/* DATE HEADER */}
                                <div
                                    className="px-3 py-3 sm:px-4 sm:py-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => toggleDate(date)}
                                >
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        <Calendar className="text-blue-600 flex-shrink-0" size={18} />
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm sm:text-base">
                                                {new Date(date).toLocaleDateString("en-IN", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            {allAttachments.length > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setModalTitle(`Attachments – ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`);
                                                        setModalAttachments(allAttachments);
                                                        setModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 mt-1 hover:underline"
                                                >
                                                    <FolderOpen size={12} className="sm:size-[14px]" />
                                                    {allAttachments.length} file{allAttachments.length > 1 ? "s" : ""}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right space-y-1">
                                        <div className="text-[10px] sm:text-xs text-gray-500">Net Balance</div>
                                        <div className={`font-bold ${dayBalance >= 0 ? "text-green-600" : "text-red-600"} text-lg sm:text-xl`}>
                                            {dayBalance >= 0 ? "₹" : "-₹"}
                                            {Math.abs(dayBalance).toFixed(0)}
                                        </div>

                                        {isOpen && (
                                            <div className="text-xs space-y-0.5 mt-2 border-t border-gray-300 pt-1">
                                                {dayIncome > 0 && (
                                                    <div className="text-green-600">
                                                        Income: ₹{dayIncome.toFixed(0)}
                                                    </div>
                                                )}
                                                {dayTotalExpense > 0 && (
                                                    <div className="text-red-600">
                                                        Total Expense: ₹{dayTotalExpense.toFixed(0)}
                                                    </div>
                                                )}
                                                {dayMaintenance > 0 && (
                                                    <div className="text-orange-600">
                                                        ↳ Maintenance: ₹{dayMaintenance.toFixed(0)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* TRANSACTIONS */}
                                {isOpen && (
                                    <div className="p-4 space-y-6 border-t border-gray-100">
                                        {/* INCOME */}
                                        {sortedIncomes.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mb-3">
                                                    <TrendingUp size={18} />
                                                    <span>Income</span>
                                                    <span className="ml-auto font-bold text-green-600">
                                                        ₹{dayIncome.toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="space-y-3">
                                                    {sortedIncomes.map((r) => (
                                                        <TransactionItem key={r.id} r={r} isOwner={isOwner} deleteRecord={deleteRecord} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* EXPENSES (Regular + Maintenance grouped under Total Expense) */}
                                        {(sortedExpenses.length > 0 || sortedMaintenances.length > 0) && (
                                            <div>
                                                <div className="flex items-center gap-2 text-red-600 font-bold text-base mb-4">
                                                    <TrendingDown size={20} />
                                                    <span>Total Expense (incl. Maintenance)</span>
                                                    <span className="ml-auto font-extrabold text-red-600">
                                                        ₹{dayTotalExpense.toFixed(0)}
                                                    </span>
                                                </div>

                                                {/* Regular Expenses */}
                                                {sortedExpenses.length > 0 && (
                                                    <div className="mb-5">
                                                        <div className="text-sm font-medium text-gray-700 mb-2">Regular Expenses</div>
                                                        <div className="space-y-3">
                                                            {sortedExpenses.map((r) => (
                                                                <TransactionItem key={r.id} r={r} isOwner={isOwner} deleteRecord={deleteRecord} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Maintenance */}
                                                {sortedMaintenances.length > 0 && (
                                                    <div className="pt-4 border-t-2 border-dashed border-orange-400">
                                                        <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-3">
                                                            <Wrench size={18} />
                                                            <span>Maintenance</span>
                                                            <span className="ml-auto font-bold text-orange-600">
                                                                ₹{dayMaintenance.toFixed(0)}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-3 pl-6 border-l-4 border-orange-400">
                                                            {sortedMaintenances.map((r) => (
                                                                <TransactionItem key={r.id} r={r} isOwner={isOwner} deleteRecord={deleteRecord} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ATTACHMENTS MODAL */}
            {modalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="px-5 pt-4 pb-3 flex justify-between items-center border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 text-lg">{modalTitle}</h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={22} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-2">
                                {modalAttachments.length === 0 ? (
                                    <p className="text-center text-gray-500 py-12 text-base">No attachments found</p>
                                ) : (
                                    modalAttachments.map((att, i) => (
                                        <AttachmentItemGoogle key={att.id || i} attachment={att} />
                                    ))
                                )}
                            </div>
                            {modalAttachments.length > 0 && (
                                <div className="px-5 py-3 border-t border-gray-200 text-center text-sm text-gray-600 font-medium">
                                    {modalAttachments.length} file{modalAttachments.length > 1 ? "s" : ""} total
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
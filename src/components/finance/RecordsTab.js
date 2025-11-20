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
} from "lucide-react";

const AttachmentItemGoogle = ({ attachment }) => {
  const isPDF = /\.pdf$/i.test(attachment.file_name);
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(attachment.file_name);

  return (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition"
    >
      {isImage ? (
        <img
          src={attachment.file_url}
          alt=""
          className="w-10 h-10 rounded-lg object-cover border border-gray-300"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-xs font-bold text-red-600">PDF</span>
        </div>
      )}

      <span className="flex-1 text-sm text-gray-800 font-medium truncate">
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
}) {
  const groupedRecords = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const filteredDates = Object.keys(groupedRecords)
    .filter((d) => !filterDate || d === filterDate)
    .sort((a, b) => new Date(b) - new Date(a));

  return (
    <>
      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
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
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterBus}
            onChange={(e) => setFilterBus(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="mt-3 w-full py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 sm:p-5 mb-5 sm:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
            <IndianRupee size={20} />
          </div>
          <h3 className="font-bold text-gray-800 text-base sm:text-lg">Summary</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="text-[11px] sm:text-xs font-medium text-green-700 opacity-80">Income</div>
            <div className="text-lg sm:text-xl font-bold text-green-700">₹{grandIncome.toFixed(0)}</div>
          </div>

          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <div className="text-[11px] sm:text-xs font-medium text-red-700 opacity-80">Expense</div>
            <div className="text-lg sm:text-xl font-bold text-red-700">₹{grandExpense.toFixed(0)}</div>
          </div>

          <div className={`rounded-xl p-3 border ${grandBalance >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <div className={`text-[11px] sm:text-xs font-medium opacity-80 ${grandBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
              Net
            </div>
            <div className={`text-xl sm:text-2xl font-extrabold ${grandBalance >= 0 ? "text-green-700" : "text-red-700"}`}>
              {grandBalance >= 0 ? "₹" : "-₹"}{Math.abs(grandBalance).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* RECORDS LIST */}
      {loadingRecords ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : filteredDates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-gray-500 font-medium">No records found</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredDates.map((date) => {
            const dayRecs = groupedRecords[date];
            const allAttachments = dayRecs.flatMap((r) => r.attachments || []);
            const isOpen = openDates[date];

            const dayIncome = dayRecs.filter((r) => r.transaction_type === "INCOME").reduce((s, r) => s + parseFloat(r.amount), 0);
            const dayExpense = dayRecs.filter((r) => r.transaction_type === "EXPENSE").reduce((s, r) => s + parseFloat(r.amount), 0);
            const dayBalance = dayIncome - dayExpense;

            return (
              <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* DATE HEADER */}
                <div
                  className="px-3 py-3 sm:px-4 sm:py-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition select-none"
                  onClick={() => toggleDate(date)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {isOpen ? <ChevronDown className="text-gray-600" size={22} /> : <ChevronRight className="text-gray-600" size={22} />}
                    <Calendar className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
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
                          className="flex items-center gap-1.5 mt-0.5 text-xs text-blue-600 font-medium hover:text-blue-700 transition"
                        >
                          <FolderOpen size={13} />
                          <span>{allAttachments.length} attachment{allAttachments.length > 1 ? "s" : ""}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-right ml-3">
                    <div className="text-[11px] sm:text-xs text-gray-500">Net Balance</div>
                    <div className={`text-base sm:text-xl font-extrabold ${dayBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {dayBalance >= 0 ? "₹" : "-₹"}{Math.abs(dayBalance).toFixed(0)}
                    </div>
                  </div>
                </div>

                {/* TRANSACTIONS - DELETE BUTTON FIXED & ALWAYS VISIBLE */}
                {isOpen && (
                  <div className="p-3 sm:p-4 space-y-3 border-t border-gray-100">
                    {dayRecs.map((r) => (
                      <div
                        key={r.id}
                        className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 flex items-center gap-3 min-w-0">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                              r.transaction_type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {r.transaction_type === "INCOME" ? "IN" : "EXP"}
                          </span>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {r.category_name}
                            </div>
                            <div className="text-xs text-gray-500">{r.bus_name || "No bus"}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-base sm:text-lg whitespace-nowrap ${r.transaction_type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                            ₹{parseFloat(r.amount).toFixed(0)}
                          </span>

                          {/* DELETE BUTTON - NOW ALWAYS VISIBLE */}
                          {isOwner && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRecord(r.id);
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ATTACHMENT MODAL */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <div
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-2 text-center sm:hidden">
                <div className="w-10 h-0.5 bg-gray-400 rounded-full mx-auto" />
              </div>

              <div className="px-5 pt-2 pb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">{modalTitle}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition">
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 space-y-2">
                {modalAttachments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-sm">No attachments</div>
                ) : (
                  modalAttachments.map((att, i) => (
                    <AttachmentItemGoogle key={att.id || i} attachment={att} />
                  ))
                )}
              </div>

              {modalAttachments.length > 0 && (
                <div className="px-5 py-2.5 border-t border-gray-200 text-center">
                  <span className="text-xs text-gray-600 font-medium">
                    {modalAttachments.length} file{modalAttachments.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
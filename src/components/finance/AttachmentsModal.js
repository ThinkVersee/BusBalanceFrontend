// src/components/finance/AttachmentsModal.js
import React from "react";
import { X, FileText, ExternalLink } from "lucide-react";

function AttachmentItem({ attachment }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.file_name);
  const isPDF = /\.pdf$/i.test(attachment.file_name);

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded border">
      {isImage ? (
        <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
          <img
            src={attachment.file_url}
            alt={attachment.file_name}
            className="w-16 h-16 object-cover rounded border"
          />
        </a>
      ) : isPDF ? (
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <FileText size={16} />
          <span className="text-xs">{attachment.file_name}</span>
          <ExternalLink size={14} />
        </a>
      ) : (
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:underline"
        >
          <FileText size={16} />
          <span className="text-xs">{attachment.file_name}</span>
        </a>
      )}
    </div>
  );
}

export default function AttachmentsModal({ isOpen, onClose, title, attachments }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {attachments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No attachments found</p>
          ) : (
            attachments.map((att) => (
              <AttachmentItem key={att.id} attachment={att} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
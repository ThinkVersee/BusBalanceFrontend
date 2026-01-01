import React from 'react';
import { Ban, Trash2, AlertCircle, Loader2, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,

  // Customizable props
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger', 'warning', 'success'
  icon: CustomIcon = AlertCircle,
  entity,
  entityName,
}) => {
  if (!isOpen) return null;

  // Variant styles
  const variants = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      // shadow: 'shadow-red-600/20',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
      // shadow: 'shadow-orange-600/20',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      // shadow: 'shadow-green-600/20',
    },
  };

  const v = variants[confirmVariant] || variants.danger;

  // Build display name
  const displayName =
    entityName ||
    (entity && (
      entity.owner?.name ||
      entity.owner_name ||
      entity.name ||
      entity.bus_name ||
      entity.registration_number ||
      'this item'
    )) ||
    'this item';

  const finalMessage = message
    .replace('{name}', displayName)
    .replace('{entity}', displayName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className={`
        relative w-full max-w-md transform transition-all
        bg-white rounded-2xl  overflow-hidden
        border ${v.border}
        animate-in fade-in zoom-in-95 duration-200
      `}>
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className={`
            w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center
            ${v.iconBg} ${v.iconColor} 
          `}>
            <CustomIcon size={32} className="animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            {title}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 text-sm sm:text-black leading-relaxed mb-8">
            {finalMessage}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Cancel */}
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 px-5 py-3 rounded-xl
                         border border-gray-300 text-gray-700
                         hover:bg-gray-50 font-medium text-sm sm:text-black
                         transition-all duration-200"
            >
              {cancelText}
            </button>

            {/* Confirm */}
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                flex-1 order-1 sm:order-2 flex items-center justify-center gap-2
                px-5 py-3 rounded-xl text-white font-medium text-sm sm:text-black
                transition-all duration-200 
                ${v.button} focus:ring-4 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
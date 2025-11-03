import React from 'react';
import { Ban, Trash2, AlertCircle } from 'lucide-react';

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
      bg: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-600/30',
    },
    warning: {
      bg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30',
    },
    success: {
      bg: 'bg-green-100',
      iconColor: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 shadow-green-600/30',
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        {/* Icon */}
        <div
          className={`w-16 h-16 ${v.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
        >
          <CustomIcon className={`${v.iconColor}`} size={32} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 text-center">
          {finalMessage}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-white font-medium transition-all shadow-lg ${v.button} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
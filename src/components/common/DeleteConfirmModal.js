import { createElement as h } from 'react';
import { Trash2 } from 'lucide-react';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  entity,
  onConfirm,
  loading,
}) => {
  if (!isOpen || !entity) return null;

  return h(
    'div',
    {
      className:
        'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50',
    },
    h(
      'div',
      { className: 'bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl' },
      h(
        'div',
        {
          className: 'w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4',
        },
        h(Trash2, { className: 'text-red-600', size: 32 })
      ),
      h(
        'h2',
        { className: 'text-2xl font-bold text-gray-900 mb-3 text-center' },
        'Confirm Deletion'
      ),
      h(
        'p',
        {
          className: 'text-gray-600 mb-8 text-center',
          dangerouslySetInnerHTML: {
            __html: `Are you sure you want to delete <span class="font-semibold text-gray-900">${entity.name}</span>? This action cannot be undone.`,
          },
        }
      ),
      h(
        'div',
        { className: 'flex justify-end gap-3' },
        h(
          'button',
          {
            onClick: onClose,
            className:
              'px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium',
          },
          'Cancel'
        ),
        h(
          'button',
          {
            onClick: onConfirm,
            disabled: loading,
            className:
              'px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg disabled:opacity-50',
          },
          loading ? 'Deleting...' : 'Delete'
        )
      )
    )
  );
};
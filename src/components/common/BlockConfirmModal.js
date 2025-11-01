import { createElement as h } from 'react';
import { Ban } from 'lucide-react';

export const BlockConfirmModal = ({
  isOpen,
  onClose,
  entity,
  action,      // 'block' or 'unblock'
  onConfirm,
  loading,
}) => {
  if (!isOpen || !entity) return null;

  const isBlocking = action === 'block';

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
          className: `w-16 h-16 ${isBlocking ? 'bg-orange-100' : 'bg-green-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`,
        },
        h(Ban, { className: isBlocking ? 'text-orange-600' : 'text-green-600', size: 32 })
      ),
      h(
        'h2',
        { className: 'text-2xl font-bold text-gray-900 mb-3 text-center' },
        isBlocking ? 'Block?' : 'Unblock?'
      ),
      h(
        'p',
        { className: 'text-gray-600 mb-8 text-center' },
        isBlocking
          ? `Are you sure you want to block ${entity.name}? They will no longer be able to log in.`
          : `Are you sure you want to unblock ${entity.name}? They will regain access.`
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
            className: `px-6 py-2.5 rounded-xl text-white font-medium transition-all ${
              isBlocking
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
                : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
            } shadow-lg disabled:opacity-50`,
          },
          loading ? (isBlocking ? 'Blocking...' : 'Unblocking...') : (isBlocking ? 'Block' : 'Unblock')
        )
      )
    )
  );
};
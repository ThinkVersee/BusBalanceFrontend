import { X, Loader2 } from 'lucide-react';
import { createElement as h } from 'react';

export const FormModal = ({
  isOpen,
  onClose,
  title = 'Form',
  icon: Icon = null,
  sections = [],
  register,
  errors,
  onSubmit,
  loading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  extraInfo = null,
}) => {
  if (!isOpen) return null;

  return h(
    'div',
    {
      className:
        'fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto',
    },
    h(
      'div',
      {
        className:
          'bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl',
      },
      h(
        'div',
        { className: 'p-5 sm:p-8' },

        // HEADER
        h(
          'div',
          { className: 'flex justify-between items-start sm:items-center mb-6 gap-4' },
          h(
            'div',
            { className: 'flex items-center gap-3' },
            Icon && h('div', {
              className:
                'w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center',
              children: h(Icon, { className: 'text-white', size: 20 }),
            }),
            h('h2', { className: 'text-xl sm:text-2xl font-bold text-gray-900' }, title)
          ),
          h(
            'button',
            {
              onClick: onClose,
              className:
                'text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all',
            },
            h(X, { size: 24 })
          )
        ),

        // FORM
        h(
          'form',
          { onSubmit, className: 'space-y-6' },

          // DYNAMIC SECTIONS
          sections.map((section, secIdx) =>
            h(
              'div',
              { key: secIdx, className: 'bg-gray-50 rounded-xl p-4 sm:p-5' },
              h(
                'h3',
                {
                  className:
                    'text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2',
                },
                h('span', { className: 'w-2 h-2 bg-blue-600 rounded-full' }),
                section.title
              ),
              h(
                'div',
                { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
                section.fields.map((field, fieldIdx) => {
                  const baseInputClass =
                    'w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';

                  const label = h(
                    'label',
                    {
                      className: 'block text-sm font-medium text-gray-700 mb-1',
                    },
                    field.label,
                    field.required && h('span', { className: 'text-red-600 ml-1' }, '*')
                  );

                  const error = errors[field.name] && h(
                    createsElement('p', { className: 'text-red-600 text-xs mt-1' }, errors[field.name].message)
                  );

                  // INPUT / TEXTAREA / SELECT
                  let inputElement;

                  if (field.type === 'textarea') {
                    inputElement = h('textarea', {
                      ...register(field.name),
                      placeholder: field.placeholder,
                      rows: field.rows || 3,
                      className: baseInputClass,
                      disabled: field.disabled,
                    });
                  } else if (field.type === 'select') {
                    inputElement = h(
                      'select',
                      {
                        ...register(field.name),
                        disabled: field.disabled || field.options?.length === 0,
                        className: baseInputClass,
                      },
                      h('option', { value: '' }, field.placeholder || 'Select...'),
                      field.options?.map(opt =>
                        h('option', { key: opt.value, value: opt.value }, opt.label)
                      )
                    );
                  } else {
                    inputElement = h('input', {
                      ...register(field.name),
                      type: field.type || 'text',
                      placeholder: field.placeholder,
                      className: baseInputClass,
                      disabled: field.disabled,
                    });
                  }

                  return h(
                    'div',
                    {
                      key: fieldIdx,
                      className: field.colSpan || 'col-span-1 sm:col-span-2',
                    },
                    label,
                    inputElement,
                    error
                  );
                })
              )
            )
          ),

          // EXTRA INFO
          extraInfo && h(
            'div',
            { className: 'col-span-1 sm:col-span-2 text-sm text-gray-600' },
            extraInfo
          ),

          // BUTTONS
          h(
            'div',
            { className: 'flex flex-col sm:flex-row justify-end gap-3 mt-6' },
            h(
              'button',
              {
                type: 'button',
                onClick: onClose,
                className:
                  'w-full sm:w-auto order-2 sm:order-1 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium',
              },
              cancelLabel
            ),
            h(
              'button',
              {
                type: 'submit',
                disabled: loading,
                className:
                  'w-full sm:w-auto order-1 sm:order-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2',
              },
              loading && h(Loader2, { size: 18, className: 'animate-spin' }),
              loading ? 'Saving...' : submitLabel
            )
          )
        )
      )
    )
  );
};
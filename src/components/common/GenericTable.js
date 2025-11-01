import { Loader2 } from 'lucide-react';
import { createElement as h } from 'react';

export const GenericTable = ({
  rows = [],
  columns = [],
  loading = false,
  emptyMessage = 'No records found',
}) => {
  if (loading) {
    return h(
      'div',
      { className: 'p-8 flex justify-center items-center' },
      h(Loader2, { className: 'animate-spin text-blue-600', size: 36 })
    );
  }

  if (!rows.length) {
    return h(
      'div',
      { className: 'p-8 text-center text-gray-500 text-sm' },
      emptyMessage
    );
  }

  return h(
    'div',
    { className: 'overflow-x-auto' },
    h(
      'table',
      { className: 'min-w-full divide-y divide-gray-200' },
      // HEADER
      h(
        'thead',
        { className: 'bg-gradient-to-r from-gray-50 to-gray-100' },
        h(
          'tr',
          null,
          columns.map((col, idx) =>
            h(
              'th',
              {
                key: idx,
                className:
                  'px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider',
              },
              col.header
            )
          )
        )
      ),
      // BODY
      h(
        'tbody',
        { className: 'bg-white divide-y divide-gray-100' },
        rows.map((row, rowIdx) =>
          h(
            'tr',
            {
              key: row.id ?? rowIdx,
              className: 'hover:bg-blue-50/50 transition-colors duration-150',
            },
            columns.map((col, colIdx) => {
              let value;
              if (col.cell) {
                value = col.cell(row);
              } else if (typeof col.accessor === 'function') {
                value = col.accessor(row);
              } else {
                value = row[col.accessor] ?? (col.fallback ?? '');
              }

              return h(
                'td',
                {
                  key: colIdx,
                  className: 'px-6 py-4 text-sm text-gray-700 whitespace-nowrap',
                },
                value
              );
            })
          )
        )
      )
    )
  );
};
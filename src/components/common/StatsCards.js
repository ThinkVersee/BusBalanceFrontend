'use client';
import { createElement as h } from 'react';

export const StatsCards = ({ total, active, verified, operational, label = 'Items' }) => {
  const cards = [];

  // Total (always shown)
  if (total !== undefined && total !== null) {
    cards.push(
      h(
        'div',
        {
          key: 'total',
          className:
            'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100',
        },
        h('p', { className: 'text-sm text-gray-600' }, `Total ${label}`),
        h('p', { className: 'text-2xl font-bold text-gray-900' }, total)
      )
    );
  }

  // Active (only if explicitly passed)
  if (active !== undefined && active !== null) {
    cards.push(
      h(
        'div',
        {
          key: 'active',
          className:
            'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100',
        },
        h('p', { className: 'text-sm text-gray-600' }, 'Active'),
        h('p', { className: 'text-2xl font-bold text-green-600' }, active)
      )
    );
  }

  // Verified (only if defined)
  if (verified !== undefined && verified !== null) {
    cards.push(
      h(
        'div',
        {
          key: 'verified',
          className:
            'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100',
        },
        h('p', { className: 'text-sm text-gray-600' }, 'Verified'),
        h('p', { className: 'text-2xl font-bold text-blue-600' }, verified)
      )
    );
  }

  // Operational (only if defined)
  if (operational !== undefined && operational !== null) {
    cards.push(
      h(
        'div',
        {
          key: 'operational',
          className:
            'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100',
        },
        h('p', { className: 'text-sm text-gray-600' }, 'Operational'),
        h('p', { className: 'text-2xl font-bold text-indigo-600' }, operational)
      )
    );
  }

  return h(
    'div',
    {
      className: `grid grid-cols-1 ${
        cards.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
      } gap-4 mt-4 mb-6`,
    },
    ...cards
  );
};

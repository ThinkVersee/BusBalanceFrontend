'use client';

import { createElement as h } from 'react';

export const StatsCards = ({
  total,
  active,
  verified,
  operational,
  label = 'Items'
}) => {
  const cards = [];

  // Total Card
  if (total != null) {
    cards.push(
      h(
        'div',
        {
          key: 'total',
          className: 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center sm:text-left min-w-0'
        },
        h('p', { className: 'text-sm text-gray-600 truncate' }, `Total ${label}`),
        h('p', { className: 'text-2xl font-bold text-gray-900 mt-1' }, total.toLocaleString())
      )
    );
  }

  // Active Card
  if (active != null) {
    cards.push(
      h(
        'div',
        {
          key: 'active',
          className: 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center sm:text-left min-w-0'
        },
        h('p', { className: 'text-sm text-gray-600' }, 'Active'),
        h('p', { className: 'text-2xl font-bold text-green-600 mt-1' }, active.toLocaleString())
      )
    );
  }

  // Verified Card
  if (verified != null) {
    cards.push(
      h(
        'div',
        {
          key: 'verified',
          className: 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center sm:text-left min-w-0'
        },
        h('p', { className: 'text-sm text-gray-600' }, 'Verified'),
        h('p', { className: 'text-2xl font-bold text-blue-600 mt-1' }, verified.toLocaleString())
      )
    );
  }

  // Operational Card
  if (operational != null) {
    cards.push(
      h(
        'div',
        {
          key: 'operational',
          className: 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center sm:text-left min-w-0'
        },
        h('p', { className: 'text-sm text-gray-600' }, 'Operational'),
        h('p', { className: 'text-2xl font-bold text-indigo-600 mt-1' }, operational.toLocaleString())
      )
    );
  }

  // Dynamic responsive grid
  const getGridClass = () => {
    const len = cards.length;
    if (len === 1) return 'grid-cols-1';
    if (len === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (len === 3) return 'grid-cols-1 sm:grid-cols-3';
    if (len >= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1';
  };

  return h(
    'div',
    {
      className: `grid ${getGridClass()} gap-4 mt-4 mb-6`
    },
    ...cards
  );
};
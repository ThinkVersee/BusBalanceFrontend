'use client';

import { createElement as h } from 'react';

export const StatsCards = ({
  total,
  active,
  verified,
  operational,
  label = 'Items',
}) => {
  const cards = [];

  const cardClass =
    'bg-white rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-300 text-center sm:text-left min-w-0';

  const titleClass =
    'text-xs sm:text-sm text-gray-600 truncate';

  const valueBase =
    'text-lg sm:text-2xl font-semibold sm:font-bold mt-0.5 sm:mt-1';

  // Total Card
  if (total != null) {
    cards.push(
      h(
        'div',
        { key: 'total', className: cardClass },
        h('p', { className: titleClass }, `Total ${label}`),
        h(
          'p',
          { className: `${valueBase} text-gray-900` },
          total.toLocaleString()
        )
      )
    );
  }

  // Active Card
  if (active != null) {
    cards.push(
      h(
        'div',
        { key: 'active', className: cardClass },
        h('p', { className: titleClass }, 'Active'),
        h(
          'p',
          { className: `${valueBase} text-green-600` },
          active.toLocaleString()
        )
      )
    );
  }

  // Verified Card
  if (verified != null) {
    cards.push(
      h(
        'div',
        { key: 'verified', className: cardClass },
        h('p', { className: titleClass }, 'Verified'),
        h(
          'p',
          { className: `${valueBase} text-blue-600` },
          verified.toLocaleString()
        )
      )
    );
  }

  // Operational Card
  if (operational != null) {
    cards.push(
      h(
        'div',
        { key: 'operational', className: cardClass },
        h('p', { className: titleClass }, 'Operational'),
        h(
          'p',
          { className: `${valueBase} text-indigo-600` },
          operational.toLocaleString()
        )
      )
    );
  }

  // Responsive grid logic
  const getGridClass = () => {
    const len = cards.length;
    if (len === 1) return 'grid-cols-1';
    if (len === 2) return 'grid-cols-2 sm:grid-cols-2';
    if (len === 3) return 'grid-cols-2 sm:grid-cols-3';
    if (len >= 4) return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1';
  };

  return h(
    'div',
    {
      className: `grid ${getGridClass()} gap-2 sm:gap-4 mt-2 sm:mt-4 mb-4 sm:mb-6`,
    },
    ...cards
  );
};

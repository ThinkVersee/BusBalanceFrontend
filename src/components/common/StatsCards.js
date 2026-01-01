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

  const baseCardClass =
    'rounded-lg sm:rounded-xl p-3 sm:p-4 min-w-0 text-center sm:text-left ';

  const valueBase =
    'text-lg sm:text-2xl font-semibold sm:font-bold mt-1';

  // Function to get background and text color per type
  const getCardColors = (type) => {
    switch (type) {
      case 'total':
        return { bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700', label: 'text-blue-600' };
      case 'active':
        return { bg: 'bg-green-50 border border-green-200', text: 'text-green-600', label: 'text-green-600' };
      case 'verified':
        return { bg: 'bg-red-50 border border-red-200', text: 'text-red-600', label: 'text-red-500' };
      case 'operational':
        return { bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-600', label: 'text-purple-500' };
      default:
        return { bg: 'bg-white border border-gray-300', text: 'text-gray-900', label: 'text-gray-600' };
    }
  };

  // Total Card
  if (total != null) {
    const colors = getCardColors('total');
    cards.push(
      h(
        'div',
        { key: 'total', className: baseCardClass + colors.bg },
        h('p', { className: `text-sm sm:text-black ${colors.label} truncate` }, `Total ${label}`),
        h('p', { className: `${valueBase} ${colors.text}` }, total.toLocaleString())
      )
    );
  }

  // Active Card
  if (active != null) {
    const colors = getCardColors('active');
    cards.push(
      h(
        'div',
        { key: 'active', className: baseCardClass + colors.bg },
        h('p', { className: `text-sm sm:text-black ${colors.label} truncate` }, 'Active'),
        h('p', { className: `${valueBase} ${colors.text}` }, active.toLocaleString())
      )
    );
  }

  // Verified Card
  if (verified != null) {
    const colors = getCardColors('verified');
    cards.push(
      h(
        'div',
        { key: 'verified', className: baseCardClass + colors.bg },
        h('p', { className: `text-sm sm:text-black ${colors.label} truncate` }, 'Verified'),
        h('p', { className: `${valueBase} ${colors.text}` }, verified.toLocaleString())
      )
    );
  }

  // Operational Card
  if (operational != null) {
    const colors = getCardColors('operational');
    cards.push(
      h(
        'div',
        { key: 'operational', className: baseCardClass + colors.bg },
        h('p', { className: `text-sm sm:text-black ${colors.label} truncate` }, 'Operational'),
        h('p', { className: `${valueBase} ${colors.text}` }, operational.toLocaleString())
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
      className: `grid ${getGridClass()} gap-3 sm:gap-4 mt-4 sm:mt-6 mb-4 sm:mb-6`,
    },
    ...cards
  );
};

import { createElement as h } from 'react';

export const StatsCards = ({ total, active, verified, label = 'Items' }) => h(
  'div',
  { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-6' },
  // Total
  h(
    'div',
    { className: 'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100' },
    h('p', { className: 'text-sm text-gray-600' }, `Total ${label}`),
    h('p', { className: 'text-2xl font-bold text-gray-900' }, total)
  ),
  // Active
  h(
    'div',
    { className: 'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100' },
    h('p', { className: 'text-sm text-gray-600' }, 'Active'),
    h('p', { className: 'text-2xl font-bold text-green-600' }, active)
  ),
  // Verified
  h(
    'div',
    { className: 'bg-white rounded-xl p-4 shadow-sm text-center sm:text-left border border-gray-100' },
    h('p', { className: 'text-sm text-gray-600' }, 'Verified'),
    h('p', { className: 'text-2xl font-bold text-blue-600' }, verified)
  )
);
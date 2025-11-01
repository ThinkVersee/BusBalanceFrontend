import { Search } from 'lucide-react';
import { createElement as h } from 'react';

export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => h(
  'div',
  { className: 'relative flex-1 max-w-md' },
  h(Search, {
    className: 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400',
    size: 20,
  }),
  h('input', {
    type: 'text',
    placeholder,
    value,
    onChange: e => onChange(e.target.value),
    className:
      'pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all',
  })
);
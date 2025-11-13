'use client';

import { Search } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  // Optional – you can pass a custom class string from the parent if you ever need it
  extraClass = '',
}) => (
  <div className="relative flex-1 min-w-0">
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      size={18}
    />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full
        pl-10 pr-4 py-2.5
        text-sm sm:text-base
        border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-200
        placeholder:text-gray-400
        bg-white
        text-gray-900          /* THIS LINE FIXES THE WHITE-TEXT ISSUE */
        ${extraClass}
      `.trim().replace(/\s+/g, ' ')}
    />
  </div>
);
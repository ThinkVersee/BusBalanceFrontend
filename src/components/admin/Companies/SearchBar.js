import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="text"
      placeholder="Search by name, company, email, or license..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
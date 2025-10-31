import { Plus } from 'lucide-react';
import { SearchBar } from './SearchBar';

export const ActionBar = ({ search, onSearch, onAdd }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
    <div className="flex justify-between items-center">
      <SearchBar value={search} onChange={onSearch} />
      <button
        onClick={onAdd}
        className="ml-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
      >
        <Plus size={20} /> Add New Owner
      </button>
    </div>
  </div>
);
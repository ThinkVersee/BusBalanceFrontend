import { Plus, Loader2 } from 'lucide-react';
import { SearchBar } from './SearchBar';

export const ActionBar = ({
  search,
  onSearch,
  onAdd,
  onAddDisabled = false,
  addLabel = 'Add New',
  searchPlaceholder = 'Search...',
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-6 border border-gray-100">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">

      {/* SEARCH */}
      <SearchBar
        value={search}
        onChange={onSearch}
        placeholder={searchPlaceholder}
      />

      {/* ADD BUTTON */}
      <button
        onClick={onAdd}
        disabled={onAddDisabled}
        className={`
          w-full sm:w-auto sm:ml-4 flex justify-center items-center gap-2
          bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl
          hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30
          ${onAddDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `.trim().replace(/\s+/g, ' ')}
      >
        {onAddDisabled ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Plus size={20} />
        )}
        <span>{onAddDisabled ? 'Loading...' : addLabel}</span>
      </button>
    </div>
  </div>
);
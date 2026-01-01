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
  <div className="bg-white rounded-xl   p-4 sm:p-5 mb-6 border border-gray-300">
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
      
      {/* SEARCH BAR - Full width on mobile, flexible on desktop */}
      <div className="flex-1 min-w-0">
        <SearchBar
          value={search}
          onChange={onSearch}
          placeholder={searchPlaceholder}
        />
      </div>

      {/* ADD BUTTON - Full width on mobile, auto on desktop */}
      <button
        onClick={onAdd}
        disabled={onAddDisabled}
        className={`
          flex justify-center items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm
          bg-gradient-to-r from-blue-600 to-blue-700 text-white
          hover:from-blue-700 hover:to-blue-800 transition-all duration-200
          
          w-full sm:w-auto
          ${onAddDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        `.trim().replace(/\s+/g, ' ')}
      >
        {onAddDisabled ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Plus size={18} />
            <span className="hidden sm:inline">{addLabel}</span>
            <span className="sm:hidden">Add</span>
          </>
        )}
      </button>
    </div>
  </div>
);
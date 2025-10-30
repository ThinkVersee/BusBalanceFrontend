import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-gray-800 font-semibold">U</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-800">User123</div>
              <div className="text-xs text-gray-500">user123@gmail.com</div>
            </div>
            <ChevronDown size={20} className="text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                Profile
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">
                Settings
              </button>
              <hr className="my-2" />
              <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
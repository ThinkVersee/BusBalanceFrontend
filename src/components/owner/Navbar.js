// components/Navbar.js
'use client';

import { Search, ChevronDown, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

export default function Navbar({ isSuperAdmin = false, onMenuToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  /* -------------------------------------------------
   * Load user from localStorage
   * ------------------------------------------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch (e) { console.error('Failed to parse user', e); }
    }
  }, []);

  /* -------------------------------------------------
   * Close dropdown on click outside
   * ------------------------------------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  /* -------------------------------------------------
   * Focus mobile search
   * ------------------------------------------------- */
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isSearchOpen]);

  /* -------------------------------------------------
   * Logout – clear cookies + storage
   * ------------------------------------------------- */
  const clearAuthCookies = (superAdmin) => {
    const prefix = superAdmin ? 'superadmin_' : '';
    const opp = superAdmin ? '' : 'superadmin_';

    Cookies.remove(`${prefix}access_token`);
    Cookies.remove(`${prefix}refresh_token`);
    localStorage.removeItem(`${prefix}access_token`);
    localStorage.removeItem(`${prefix}refresh_token`);

    Cookies.remove(`${opp}access_token`);
    Cookies.remove(`${opp}refresh_token`);
    localStorage.removeItem(`${opp}access_token`);
    localStorage.removeItem(`${opp}refresh_token`);

    localStorage.removeItem('user');
  };

  const handleLogout = () => {
    clearAuthCookies(isSuperAdmin);
    window.location.href = isSuperAdmin ? '/admin/login' : '/login';
  };

  return (
    <>
      {/* ---------- NAVBAR ---------- */}
      <nav className="fixed inset-x-0 top-0 z-20 flex items-center h-16 px-3 bg-white border-b border-gray-200 sm:px-4 md:left-64 md:px-6">
        {/* Hamburger (mobile) - ALWAYS SHOW ON MOBILE */}
        <button
          onClick={() => {
            console.log('Menu clicked, onMenuToggle:', onMenuToggle);
            if (onMenuToggle) {
              onMenuToggle();
            }
          }}
          className="p-2 rounded-lg md:hidden hover:bg-gray-100 mr-2"
          aria-label="Toggle menu"
        >
          <Menu size={22} className="text-gray-700" />
        </button>

        {/* Title – centered, responsive */}
        <h1 className="flex-1 text-sm font-semibold text-gray-800 truncate text-center sm:text-base md:text-lg lg:text-xl">
          <span className="hidden sm:inline">
            {isSuperAdmin ? 'Admin' : 'Owner'} Dashboard
          </span>
          <span className="sm:hidden">Dashboard</span>
        </h1>

        {/* Right side: Search (≥sm) + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* User Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
              aria-expanded={isDropdownOpen}
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-800 bg-yellow-400 rounded-full sm:w-9 sm:h-9 sm:text-sm">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>

              {/* Name/Email – hidden on tiny screens */}
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold text-gray-800 truncate max-w-24">
                  {user.username || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-24">
                  {user.email || 'user@example.com'}
                </div>
              </div>

              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg sm:w-56">
                {/* Mobile user info */}
                <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {user.username || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email || 'user@example.com'}
                  </div>
                </div>

              

                <hr className="my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
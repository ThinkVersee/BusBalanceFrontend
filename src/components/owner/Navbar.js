// components/Navbar.js
'use client';
import { ChevronDown, Menu, KeyRound, AlertCircle, Crown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import ChangePasswordModal from '../common/ChangePasswordModal';
import axiosInstance from '@/config/axiosInstance';

export default function Navbar({ onMenuToggle }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [user, setUser] = useState({ username: '', email: '' });
  const [subscription, setSubscription] = useState({
    status: 'loading',
    daysLeft: null,
    planName: 'Free Trial'
  });
  const dropdownRef = useRef(null);

  // Load user
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await axiosInstance.get('/owners/subscriptions/trial-status/');
        const { days_left, expired } = response.data;

        if (expired || days_left <= 0) {
          setSubscription({ status: 'expired', daysLeft: 0, planName: 'Trial Expired' });
        } else if (days_left > 0) {
          setSubscription({ status: 'trial', daysLeft: days_left, planName: 'Free Trial' });
        }
      } catch (err) {
        console.error('Failed to fetch subscription', err);
        setSubscription({ status: 'active', daysLeft: null, planName: 'Pro Plan' });
      }
    };
    fetchSubscriptionStatus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.clear();
    window.location.href = '/login';
  };

  const openChangePassword = () => {
    setIsDropdownOpen(false);
    setIsChangePassModalOpen(true);
  };

  // Always-visible, responsive subscription badge
  const SubscriptionBadge = () => {
    if (subscription.status === 'loading') return null;

    const badge = {
      trial: {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: AlertCircle,
        text: `${subscription.daysLeft}d left`,
        label: 'Trial'
      },
      active: {
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: Crown,
        text: 'Pro',
        label: 'Pro Plan'
      },
      expired: {
        bg: 'bg-red-100 text-red-800 border-red-300',
        icon: AlertCircle,
        text: 'Expired',
        label: 'Trial Expired'
      }
    };

    const { bg, icon: Icon, text, label } = badge[subscription.status] || badge.active;

    return (
      <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${bg} whitespace-nowrap`}>
        <Icon size={13} />
        <span className="hidden xs:inline">{label} · </span>
        <span>{text}</span>
      </div>
    );
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-20 flex items-center h-16 px-4 bg-white border-b border-gray-200 md:left-64 md:px-6">
        {/* Mobile Menu Button */}
        <button onClick={onMenuToggle} className="p-2 rounded-lg md:hidden hover:bg-gray-100">
          <Menu size={24} className="text-gray-700" />
        </button>

        {/* Dashboard Title — Hidden on mobile */}
        <div className="flex-1 text-center md:text-left md:ml-4">
          <h1 className="text-lg font-semibold text-gray-800 hidden md:block">
            Owner Dashboard
          </h1>
        </div>

        {/* Right Side: Always show subscription badge + user */}
        <div className="flex items-center gap-3">
          {/* Subscription Badge — Always visible */}
          <SubscriptionBadge />

          {/* User Avatar & Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-lg hover:bg-gray-50 p-2 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-medium text-gray-800">{user.username || 'User'}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email || 'user@example.com'}</p>
                </div>

                <button
                  onClick={openChangePassword}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <KeyRound size={18} />
                  Change Password
                </button>

                <div className="border-t border-gray-200" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={isChangePassModalOpen}
        onClose={() => setIsChangePassModalOpen(false)}
        isSuperAdmin={false}
      />
    </>
  );
}
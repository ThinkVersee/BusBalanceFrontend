// components/ChangePasswordModal.js
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Cookies from 'js-cookie';
import axiosInstance from '@/config/axiosInstance';

export default function ChangePasswordModal({ isOpen, onClose, isSuperAdmin = false }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 5) {
      setError('New password must be at least 5 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setSuccess(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto logout after 1.5s
      setTimeout(() => {
        onClose();
        clearAuthAndRedirect();
      }, 1500);
    } catch (err) {
      const details = err.response?.data?.details || err.message;
      const errorMsg = typeof details === 'object' ? Object.values(details).flat().join(' ') : details;
      setError(errorMsg || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const clearAuthAndRedirect = () => {
    const prefixes = isSuperAdmin ? ['superadmin_', ''] : ['', 'superadmin_'];
    prefixes.forEach((p) => {
      Cookies.remove(`${p}access_token`);
      Cookies.remove(`${p}refresh_token`);
      localStorage.removeItem(`${p}access_token`);
      localStorage.removeItem(`${p}refresh_token`);
    });
    localStorage.removeItem('user');
    window.location.href = isSuperAdmin ? '/admin/login' : '/login';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-800 mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-800 mb-1">
              New Password (min 5 characters)
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={5}
              placeholder="Enter new password"
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-800 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={5}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
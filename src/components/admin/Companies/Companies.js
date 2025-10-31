'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Ban,
  CheckCircle,
  Building2,
  Loader2,
  Mail,
} from 'lucide-react';

// ---------------------------------------------------------------------
// Zod Schema (NO PASSWORD FOR CREATE)
// ---------------------------------------------------------------------
const ownerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),

  // Password is NOT in the form for creation
  // (generated in backend and emailed)

  company_name: z.string().min(1, 'Company name required'),
  license_number: z.string().min(1, 'License required'),
  business_address: z.string().min(1, 'Address required'),
  business_phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid business phone')
    .optional()
    .or(z.literal('')),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
});

// ---------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------
const BusOwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(ownerSchema) });

  // -----------------------------------------------------------------
  // Fetch owners
  // -----------------------------------------------------------------
  const fetchOwners = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosInstance.get('/owners/bus-owners/');
      setOwners(data);
      setFilteredOwners(data);
    } catch (e) {
      setApiError(e.response?.data?.detail || e.message || 'Failed to load owners');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  // -----------------------------------------------------------------
  // Search filter
  // -----------------------------------------------------------------
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = owners.filter(
      (o) =>
        (o.name && o.name.toLowerCase().includes(q)) ||
        (o.company_name && o.company_name.toLowerCase().includes(q)) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        (o.license_number && o.license_number.toLowerCase().includes(q))
    );
    setFilteredOwners(filtered);
  }, [searchQuery, owners]);

  // -----------------------------------------------------------------
  // Form helpers
  // -----------------------------------------------------------------
  const resetForm = () => {
    reset({
      name: '',
      email: '',
      company_name: '',
      license_number: '',
      business_address: '',
      business_phone: '',
      pan_number: '',
      gst_number: '',
    });
    setSelectedOwner(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (owner) => {
    setSelectedOwner(owner);
    setValue('name', owner.name);
    setValue('email', owner.email);
    setValue('company_name', owner.company_name);
    setValue('license_number', owner.license_number);
    setValue('business_address', owner.business_address);
    setValue('business_phone', owner.business_phone || '');
    setValue('pan_number', owner.pan_number || '');
    setValue('gst_number', owner.gst_number || '');
    setIsModalOpen(true);
  };

  // -----------------------------------------------------------------
  // Submit (Create / Update)
  // -----------------------------------------------------------------
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (selectedOwner) {
        // UPDATE: No password sent
        await axiosInstance.put(`/owners/bus-owners/${selectedOwner.id}/`, data);
      } else {
        // CREATE: Backend generates password & emails it
        await axiosInstance.post('/owners/bus-owners/', data);
      }
      await fetchOwners();
      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      const msg =
        e.response?.data
          ? Object.values(e.response.data).flat().join(', ')
          : e.message;
      alert(msg || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------
  const handleDelete = (owner) => {
    setSelectedOwner(owner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOwner) return;
    try {
      await axiosInstance.delete(`/owners/bus-owners/${selectedOwner.id}/`);
      setOwners((prev) => prev.filter((o) => o.id !== selectedOwner.id));
      setIsDeleteModalOpen(false);
      setSelectedOwner(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    }
  };

  // -----------------------------------------------------------------
  // Block / Unblock
  // -----------------------------------------------------------------
  const handleBlock = async (owner) => {
    try {
      const { data } = await axiosInstance.post(`/owners/bus-owners/${owner.id}/block/`);
      setOwners((prev) =>
        prev.map((o) => (o.id === owner.id ? { ...o, is_active: data.is_active } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------------------------------
  // Verify
  // -----------------------------------------------------------------
  const handleVerify = async (owner) => {
    try {
      const { data } = await axiosInstance.post(`/owners/bus-owners/${owner.id}/verify/`);
      setOwners((prev) =>
        prev.map((o) => (o.id === owner.id ? { ...o, is_verified: data.is_verified } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bus Owner Management</h1>
              <p className="text-gray-600 text-sm">Manage bus owners and their companies</p>
            </div>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {apiError}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
              <p className="text-sm text-gray-600">Total Owners</p>
              <p className="text-2xl font-bold text-gray-900">{owners.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {owners.filter((o) => o.is_active).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-blue-600">
                {owners.filter((o) => o.is_verified).length}
              </p>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, company, email, or license..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleAdd}
              className="ml-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
            >
              <Plus size={20} />
              Add New Owner
            </button>
          </div>
        </div>

        {/* Table */}
   {/* Table */}
<div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
  {apiLoading ? (
    <div className="p-12 flex justify-center">
      <Loader2 className="animate-spin text-blue-600" size={36} />
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              License
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredOwners.map((owner) => (
            <tr key={owner.id} className="hover:bg-blue-50/50 transition-colors">
              {/* 1. Owner */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Building2 className="text-white" size={22} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-gray-900">{owner.name}</div>
                    <div className="text-sm text-gray-500">{owner.email}</div>
                  </div>
                </div>
              </td>

              {/* 2. Company */}
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{owner.company_name}</div>
                {owner.pan_number && (
                  <div className="text-xs text-gray-500 mt-1">PAN: {owner.pan_number}</div>
                )}
                {owner.gst_number && (
                  <div className="text-xs text-gray-500">GST: {owner.gst_number}</div>
                )}
              </td>

              {/* 3. License */}
              <td className="px-6 py-4">
                <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                  {owner.license_number}
                </div>
              </td>

              {/* 4. Contact */}
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{owner.business_phone || '—'}</div>
                <div className="text-xs text-gray-500 max-w-xs truncate">{owner.business_address}</div>
              </td>

              {/* 5. Status */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                      owner.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {owner.is_active ? 'Active' : 'Blocked'}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                      owner.is_verified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {owner.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </td>

              {/* 6. Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(owner)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(owner)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => handleBlock(owner)}
                    className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${
                      owner.is_active ? 'text-orange-600' : 'text-green-600'
                    }`}
                    title={owner.is_active ? 'Block' : 'Unblock'}
                  >
                    <Ban size={18} />
                  </button>
                  {!owner.is_verified && (
                    <button
                      onClick={() => handleVerify(owner)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                      title="Verify"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <Building2 className="text-white" size={20} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedOwner ? 'Edit Bus Owner' : 'Add New Bus Owner'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* User Information */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      User Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input
                          {...register('name')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          {...register('email')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                      </div>

                      {/* PASSWORD INFO: Only for CREATE */}
                      {!selectedOwner && (
                        <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                          <Mail className="text-blue-600 mt-0.5" size={18} />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Password will be auto-generated</p>
                            <p className="text-xs text-blue-700 mt-1">
                              A secure random password will be created and emailed to the owner immediately after saving.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Business Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                        <input
                          {...register('company_name')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.company_name && <p className="text-red-600 text-xs mt-1">{errors.company_name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                        <input
                          {...register('license_number')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.license_number && <p className="text-red-600 text-xs mt-1">{errors.license_number.message}</p>}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
                        <textarea
                          {...register('business_address')}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.business_address && <p className="text-red-600 text-xs mt-1">{errors.business_address.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                        <input
                          type="tel"
                          {...register('business_phone')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.business_phone && <p className="text-red-600 text-xs mt-1">{errors.business_phone.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                        <input
                          {...register('pan_number')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                        <input
                          {...register('gst_number')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium shadow-lg shadow-blue-600/30"
                    >
                      {loading ? 'Saving...' : selectedOwner ? 'Update' : 'Create & Email Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {isDeleteModalOpen && selectedOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Confirm Deletion</h2>
              <p className="text-gray-600 mb-8 text-center">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedOwner.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusOwnerManagement;
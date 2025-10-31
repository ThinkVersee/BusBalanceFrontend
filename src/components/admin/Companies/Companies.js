// src/components/admin/Companies/Companies.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import { Building2 } from 'lucide-react';

import { StatsCards } from './StatsCards';
import { ActionBar } from './ActionBar';
import { BusOwnerTable } from './BusOwnerTable';
import { BusOwnerFormModal } from './BusOwnerFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

const ownerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  company_name: z.string().min(1, 'Company name required'),
  license_number: z.string().min(1, 'License required'),
  business_address: z.string().min(1, 'Address required'),
  business_phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone').optional().or(z.literal('')),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
});

export default function BusOwnerManagement() {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(ownerSchema)
  });

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

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = owners.filter(o =>
      [o.name, o.company_name, o.email, o.license_number].some(field =>
        field?.toLowerCase().includes(q)
      )
    );
    setFilteredOwners(filtered);
  }, [searchQuery, owners]);

  const resetForm = () => {
    reset({
      name: '', email: '', company_name: '', license_number: '',
      business_address: '', business_phone: '', pan_number: '', gst_number: ''
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (selectedOwner) {
        await axiosInstance.put(`/owners/bus-owners/${selectedOwner.id}/`, data);
      } else {
        await axiosInstance.post('/owners/bus-owners/', data);
      }
      await fetchOwners();
      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      const msg = e.response?.data
        ? Object.values(e.response.data).flat().join(', ')
        : e.message;
      alert(msg || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (owner) => {
    setSelectedOwner(owner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOwner) return;
    try {
      await axiosInstance.delete(`/owners/bus-owners/${selectedOwner.id}/`);
      setOwners(prev => prev.filter(o => o.id !== selectedOwner.id));
      setIsDeleteModalOpen(false);
      setSelectedOwner(null);
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    }
  };

  const handleBlock = async (owner) => {
    try {
      const { data } = await axiosInstance.post(`/owners/bus-owners/${owner.id}/block/`);
      setOwners(prev => prev.map(o => o.id === owner.id ? { ...o, is_active: data.is_active } : o));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (owner) => {
    try {
      const { data } = await axiosInstance.post(`/owners/bus-owners/${owner.id}/verify/`);
      setOwners(prev => prev.map(o => o.id === owner.id ? { ...o, is_verified: data.is_verified } : o));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
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

        <StatsCards
          total={owners.length}
          active={owners.filter(o => o.is_active).length}
          verified={owners.filter(o => o.is_verified).length}
        />

        <ActionBar search={searchQuery} onSearch={setSearchQuery} onAdd={handleAdd} />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <BusOwnerTable
            owners={filteredOwners}
            loading={apiLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBlock={handleBlock}
            onVerify={handleVerify}
          />
        </div>

        <BusOwnerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedOwner={selectedOwner}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          owner={selectedOwner}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}
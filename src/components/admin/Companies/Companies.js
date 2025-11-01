'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import {
  Building2,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react';

// ---------- COMMON COMPONENTS ----------
import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { BlockConfirmModal } from '@/components/common/BlockConfirmModal';

const ownerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  company_name: z.string().min(1, 'Company name required'),
  license_number: z.string().min(1, 'License required'),
  business_address: z.string().min(1, 'Address required'),
  business_phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone')
    .optional()
    .or(z.literal('')),
  pan_number: z.string().optional(),
  gst_number: z.string().optional(),
});

/* --------------------------------------------------------------
   FORM SECTIONS – used by the generic FormModal
   -------------------------------------------------------------- */
const busOwnerSections = [
  {
    title: 'User Information',
    fields: [
      { label: 'Name', name: 'name', required: true },
      { label: 'Email', name: 'email', type: 'email', required: true },
    ],
  },
  {
    title: 'Business Information',
    fields: [
      { label: 'Company Name', name: 'company_name', required: true },
      { label: 'License Number', name: 'license_number', required: true },
      {
        label: 'Business Address',
        name: 'business_address',
        type: 'textarea',
        required: true,
        colSpan: 'col-span-1 sm:col-span-2',
      },
      { label: 'Business Phone', name: 'business_phone', type: 'tel' },
      { label: 'PAN Number', name: 'pan_number' },
      {
        label: 'GST Number',
        name: 'gst_number',
        colSpan: 'col-span-1 sm:col-span-2',
      },
    ],
  },
];

export default function BusOwnerManagement() {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [blockAction, setBlockAction] = useState('');
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
  // FETCH OWNERS
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
  // SEARCH FILTER
  // -----------------------------------------------------------------
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = owners.filter(o =>
      [o.name, o.company_name, o.email, o.license_number].some(f =>
        f?.toLowerCase().includes(q)
      )
    );
    setFilteredOwners(filtered);
  }, [searchQuery, owners]);

  // -----------------------------------------------------------------
  // FORM HELPERS
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

  const handleEdit = owner => {
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
  // SUBMIT (ADD / EDIT)
  // -----------------------------------------------------------------
  const onSubmit = async data => {
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

  // -----------------------------------------------------------------
  // DELETE
  // -----------------------------------------------------------------
  const handleDelete = owner => {
    setSelectedOwner(owner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOwner) return;
    try {
      await axiosInstance.delete(`/owners/bus-owners/${selectedOwner.id}/`);
      setOwners(prev => prev.filter(o => o.id !== selectedOwner.id));
      setFilteredOwners(prev => prev.filter(o => o.id !== selectedOwner.id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedOwner(null);
    }
  };

  // -----------------------------------------------------------------
  // BLOCK / UNBLOCK
  // -----------------------------------------------------------------
  const openBlockModal = owner => {
    setSelectedOwner(owner);
    setBlockAction(owner.is_active ? 'block' : 'unblock');
    setIsBlockModalOpen(true);
  };

  const confirmBlock = async () => {
    if (!selectedOwner) return;
    try {
      const { data } = await axiosInstance.post(
        `/owners/bus-owners/${selectedOwner.id}/block/`
      );
      setOwners(prev =>
        prev.map(o =>
          o.id === selectedOwner.id ? { ...o, is_active: data.is_active } : o
        )
      );
      setFilteredOwners(prev =>
        prev.map(o =>
          o.id === selectedOwner.id ? { ...o, is_active: data.is_active } : o
        )
      );
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsBlockModalOpen(false);
      setSelectedOwner(null);
    }
  };

  // -----------------------------------------------------------------
  // VERIFY
  // -----------------------------------------------------------------
  const handleVerify = async owner => {
    try {
      const { data } = await axiosInstance.post(
        `/owners/bus-owners/${owner.id}/verify/`
      );
      setOwners(prev =>
        prev.map(o =>
          o.id === owner.id ? { ...o, is_verified: data.is_verified } : o
        )
      );
      setFilteredOwners(prev =>
        prev.map(o =>
          o.id === owner.id ? { ...o, is_verified: data.is_verified } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert('Verification failed');
    }
  };

  // -----------------------------------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------------------------------
  const columns = useMemo(
    () => [
      { header: 'Name', accessor: 'name' },
      { header: 'Company', accessor: 'company_name' },
      { header: 'Email', accessor: 'email' },
      { header: 'License', accessor: 'license_number' },
      {
        header: 'Status',
        cell: row => (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.is_active ? <CheckCircle size={14} /> : <Ban size={14} />}
            {row.is_active ? 'Active' : 'Blocked'}
          </span>
        ),
      },
      {
        header: 'Verified',
        cell: row =>
          row.is_verified ? (
            <span className="text-green-600 font-medium flex items-center gap-1">
              <CheckCircle size={16} />
              Yes
            </span>
          ) : (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <XCircle size={16} />
              No
            </span>
          ),
      },
      {
        header: 'Actions',
        cell: row => (
          <div className="flex items-center gap-3">
            {/* Edit */}
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDelete(row)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            {/* Block / Unblock */}
            <button
              onClick={() => openBlockModal(row)}
              className={`${
                row.is_active
                  ? 'text-orange-600 hover:text-orange-800'
                  : 'text-green-600 hover:text-green-800'
              } transition-colors`}
              title={row.is_active ? 'Block this owner' : 'Unblock this owner'}
            >
              <Ban
                size={16}
                className={row.is_active ? 'text-orange-600' : 'text-green-600'}
              />
            </button>

            {/* Verify (only if not verified) */}
            {!row.is_verified && (
              <button
                onClick={() => handleVerify(row)}
                className="text-purple-600 hover:text-purple-800 transition-colors"
                title="Verify"
              >
                <CheckCircle size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete, openBlockModal, handleVerify]
  );

  // -----------------------------------------------------------------
  // PASSWORD HINT (shown only on Add)
  // -----------------------------------------------------------------
  const passwordHint = !selectedOwner ? (
    <div className="col-span-1 sm:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
      <Mail className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
      <div>
        <p className="text-sm font-medium text-blue-900">Password will be auto-generated</p>
        <p className="text-xs text-blue-700 mt-0.5">
          A secure random password will be created and emailed to the owner immediately after saving.
        </p>
      </div>
    </div>
  ) : null;

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bus Owner Management</h1>
              <p className="text-gray-600 text-sm">Manage bus owners and their companies</p>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        {/* STATS */}
        <StatsCards
          total={owners.length}
          active={owners.filter(o => o.is_active).length}
          verified={owners.filter(o => o.is_verified).length}
          label="Owners"
        />

        {/* ACTION BAR */}
        <ActionBar
          search={searchQuery}
          onSearch={setSearchQuery}
          onAdd={handleAdd}
          addLabel="Add New Owner"
          searchPlaceholder="Search by name, company, email, or license..."
        />

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <GenericTable
            rows={filteredOwners}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No bus owners found"
          />
        </div>

        {/* FORM MODAL */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedOwner ? 'Edit Bus Owner' : 'Add New Bus Owner'}
          icon={Building2}
          sections={busOwnerSections}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={selectedOwner ? 'Update' : 'Create & Email Password'}
          extraInfo={passwordHint}
        />

        {/* DELETE MODAL */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          entity={selectedOwner}
          onConfirm={confirmDelete}
          loading={loading}
        />

        {/* BLOCK MODAL */}
        <BlockConfirmModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          entity={selectedOwner}
          action={blockAction}
          onConfirm={confirmBlock}
          loading={false}
        />
      </div>
    </div>
  );
}
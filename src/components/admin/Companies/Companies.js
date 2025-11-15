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
import { ConfirmModal } from '@/components/common/ConfirmModal';

/* --------------------------------------------------------------
   UPDATED SCHEMA – license_number is OPTIONAL now
   -------------------------------------------------------------- */
const ownerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  company_name: z.string().min(1, 'Company name required'),
  license_number: z.string().optional().or(z.literal('')),
  business_address: z.string().min(1, 'Address required'),
  business_phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone')
    .optional()
    .or(z.literal('')),
  pan_number: z.string().optional().or(z.literal('')),
  gst_number: z.string().optional().or(z.literal('')),
});

/* --------------------------------------------------------------
   FORM SECTIONS – license_number NOT REQUIRED now
   -------------------------------------------------------------- */
const busOwnerSections = [
  {
    title: 'User Information',
    fields: [
      { label: 'Name', name: 'name', required: true },
      { label: 'Email', name: 'email', type: 'email', required: true },
      { label: 'Business Phone', name: 'business_phone', type: 'tel', required: true },
    ],
  },
  {
    title: 'Business Information',
    fields: [
      { label: 'Company Name', name: 'company_name', required: true },
      {
        label: 'Business Address',
        name: 'business_address',
        type: 'textarea',
        required: true,
        colSpan: 'col-span-1 sm:col-span-2',
      },
      { label: 'License Number', name: 'license_number' },
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

  /* --------------------------------------------------------------
     FETCH OWNERS
     -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
     SEARCH
     -------------------------------------------------------------- */
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = owners.filter(o =>
      [o.name, o.company_name, o.email, o.license_number].some(f =>
        f?.toLowerCase().includes(q)
      )
    );
    setFilteredOwners(filtered);
  }, [searchQuery, owners]);

  /* --------------------------------------------------------------
     FORM RESET
     -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
     ADD OWNER
     -------------------------------------------------------------- */
  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  /* --------------------------------------------------------------
     EDIT OWNER
     -------------------------------------------------------------- */
  const handleEdit = owner => {
    setSelectedOwner(owner);
    setValue('name', owner.name);
    setValue('email', owner.email);
    setValue('company_name', owner.company_name || '');
    setValue('license_number', owner.license_number || '');
    setValue('business_address', owner.business_address || '');
    setValue('business_phone', owner.business_phone || '');
    setValue('pan_number', owner.pan_number || '');
    setValue('gst_number', owner.gst_number || '');
    setIsModalOpen(true);
  };

  /* --------------------------------------------------------------
     SUBMIT FORM  (IMPORTANT FIX APPLIED HERE)
     -------------------------------------------------------------- */
  const onSubmit = async data => {
    setLoading(true);

    // 🔥 Normalize empty values → null
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (
        value === '' ||
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        data[key] = null;
      }
    });

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

  /* --------------------------------------------------------------
     DELETE OWNER
     -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
     BLOCK / UNBLOCK
     -------------------------------------------------------------- */
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
    } catch {
      alert('Failed to update status');
    } finally {
      setIsBlockModalOpen(false);
      setSelectedOwner(null);
    }
  };

  /* --------------------------------------------------------------
     VERIFY OWNER
     -------------------------------------------------------------- */
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
    } catch {
      alert('Verification failed');
    }
  };

  /* --------------------------------------------------------------
     TABLE COLUMNS
     -------------------------------------------------------------- */
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
            <button
              onClick={() => handleEdit(row)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={() => handleDelete(row)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={() => openBlockModal(row)}
              className={`${
                row.is_active
                  ? 'text-orange-600 hover:text-orange-800'
                  : 'text-green-600 hover:text-green-800'
              } transition-colors`}
            >
              <Ban size={16} />
            </button>

            {!row.is_verified && (
              <button
                onClick={() => handleVerify(row)}
                className="text-purple-600 hover:text-purple-800 transition-colors"
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

  /* --------------------------------------------------------------
     PASSWORD HINT
     -------------------------------------------------------------- */
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 sm:min-w-0">
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 
              bg-gradient-to-br from-blue-600 to-blue-700 
              rounded-lg sm:rounded-xl 
              flex items-center justify-center shadow-md">
              <Building2 className="text-white w-5 h-5 sm:w-5.5 lg:w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 
                font-bold text-gray-900 truncate">
                Bus Owner Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 line-clamp-2">
                Manage bus owners and their companies
              </p>
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
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedOwner(null);
          }}
          onConfirm={confirmDelete}
          loading={loading}
          title="Delete Owner?"
          message="Are you sure you want to delete {name}? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          icon={Trash2}
          entity={selectedOwner}
          entityName={selectedOwner?.name}
        />

        {/* BLOCK MODAL */}
        <ConfirmModal
          isOpen={isBlockModalOpen}
          onClose={() => {
            setIsBlockModalOpen(false);
            setSelectedOwner(null);
          }}
          onConfirm={confirmBlock}
          loading={false}
          title={blockAction === 'block' ? 'Block Owner?' : 'Unblock Owner?'}
          message={
            blockAction === 'block'
              ? 'Are you sure you want to block {name}? They will lose access.'
              : 'Are you sure you want to unblock {name}? They will regain access.'
          }
          confirmText={blockAction === 'block' ? 'Block' : 'Unblock'}
          cancelText="Cancel"
          confirmVariant={blockAction === 'block' ? 'warning' : 'success'}
          icon={Ban}
          entity={selectedOwner}
          entityName={selectedOwner?.name}
        />
      </div>
    </div>
  );
}

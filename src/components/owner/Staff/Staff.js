'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import { Users, Edit, Trash2, CheckCircle, XCircle, Ban } from 'lucide-react';

import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

/* ------------------------------------------------------------------
   1. ZOD SCHEMA
   ------------------------------------------------------------------ */
const employeeSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional().or(z.literal('')),
  employee_type: z.enum(['DRIVER', 'CONDUCTOR', 'MANAGER', 'CLEANER', 'MECHANIC']),
  date_of_birth: z.string().optional(),
  blood_group: z.string().max(5).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone').optional().or(z.literal('')),
  address: z.string().optional(),
  salary: z.coerce.number().positive('Salary must be positive').optional().or(z.literal('')),
  license_number: z.string().optional(),
  license_expiry: z.string().optional(),
  aadhar_number: z.string().regex(/^\d{12}$/, 'Aadhar must be 12 digits').optional().or(z.literal('')),
  is_active_employee: z.boolean().default(true),
  date_of_joining: z.string().min(1, 'Joining date required'),
}).refine(
  (data) => {
    if (data.employee_type === 'DRIVER') {
      return !!data.license_number && !!data.license_expiry;
    }
    return true;
  },
  { message: 'License number & expiry required for drivers', path: ['license_number'] }
);

/* ------------------------------------------------------------------
   2. FORM SECTIONS
   ------------------------------------------------------------------ */
const employeeSections = () => [
  {
    title: 'Personal Information',
    fields: [
      { label: 'Full Name *', name: 'name', required: true },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Phone', name: 'phone', type: 'tel' },
      { label: 'Date of Birth', name: 'date_of_birth', type: 'date' },
      { label: 'Blood Group', name: 'blood_group' },
      { label: 'Aadhar Number', name: 'aadhar_number' },
    ],
  },
  {
    title: 'Employment Details',
    fields: [
      {
        label: 'Role *',
        name: 'employee_type',
        type: 'select',
        required: true,
        options: [
          { value: '', label: '— Select Role —' },
          { value: 'DRIVER', label: 'Driver' },
          { value: 'CONDUCTOR', label: 'Conductor' },
          { value: 'MANAGER', label: 'Manager' },
          { value: 'CLEANER', label: 'Cleaner' },
          { value: 'MECHANIC', label: 'Mechanic' },
        ],
      },
      { label: 'Salary', name: 'salary', type: 'number', step: '0.01' },
      {
        label: 'Joining Date *',
        name: 'date_of_joining',
        type: 'date',
        required: true,
        disabled: true,
      },
    ],
  },
  {
    title: 'License (Driver only)',
    fields: [
      { label: 'License Number', name: 'license_number' },
      { label: 'License Expiry', name: 'license_expiry', type: 'date' },
    ],
  },
  {
    title: 'Address & Emergency',
    fields: [
      { label: 'Address', name: 'address', type: 'textarea' },
      { label: 'Emergency Contact Name', name: 'emergency_contact_name' },
      { label: 'Emergency Contact Phone', name: 'emergency_contact_phone', type: 'tel' },
    ],
  },
];

/* ------------------------------------------------------------------
   3. MAIN COMPONENT
   ------------------------------------------------------------------ */
export default function StaffManagement() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockAction, setBlockAction] = useState(''); // 'block' or 'unblock'
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
  });

  const currentOwnerId = axiosInstance.defaults.ownerId;

  /* --------------------------------------------------------------
     FETCH EMPLOYEES
     -------------------------------------------------------------- */
  const fetchEmployees = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosInstance.get('/employees/staff/');
      setEmployees(data);
      setFiltered(data);
    } catch (e) {
      setApiError(e.response?.data?.detail || e.message || 'Failed to load staff');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /* --------------------------------------------------------------
     SEARCH
     -------------------------------------------------------------- */
  useEffect(() => {
    const q = search.toLowerCase();
    const res = employees.filter((e) =>
      [e.user?.name, e.user?.email, e.user?.phone, e.employee_id, e.employee_type]
        .some(f => f?.toString().toLowerCase().includes(q))
    );
    setFiltered(res);
  }, [search, employees]);

  /* --------------------------------------------------------------
     FORM HELPERS
     -------------------------------------------------------------- */
  const today = new Date().toISOString().split('T')[0];

  const openAdd = () => {
    reset({
      name: '',
      email: '',
      phone: '',
      employee_type: '',
      date_of_birth: '',
      blood_group: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
      salary: '',
      license_number: '',
      license_expiry: '',
      aadhar_number: '',
      is_active_employee: true,
      date_of_joining: today,
    });
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setSelected(emp);
    setValue('name', emp.user?.name || '');
    setValue('email', emp.user?.email || '');
    setValue('phone', emp.user?.phone || '');
    setValue('employee_type', emp.employee_type);
    setValue('date_of_birth', emp.date_of_birth || '');
    setValue('blood_group', emp.blood_group || '');
    setValue('emergency_contact_name', emp.emergency_contact_name || '');
    setValue('emergency_contact_phone', emp.emergency_contact_phone || '');
    setValue('address', emp.address || '');
    setValue('salary', emp.salary ?? '');
    setValue('license_number', emp.license_number || '');
    setValue('license_expiry', emp.license_expiry || '');
    setValue('aadhar_number', emp.aadhar_number || '');
    setValue('is_active_employee', emp.is_active_employee);
    setValue('date_of_joining', emp.date_of_joining);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  /* --------------------------------------------------------------
     SUBMIT (Create / Edit)
     -------------------------------------------------------------- */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        user: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || "",
        },
        employee_type: data.employee_type,
        date_of_birth: data.date_of_birth || null,
        blood_group: data.blood_group || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        address: data.address || null,
        salary: data.salary ? Number(data.salary) : null,
        license_number: data.license_number || null,
        license_expiry: data.license_expiry || null,
        aadhar_number: data.aadhar_number || null,
        is_active_employee: data.is_active_employee,
        date_of_joining: data.date_of_joining,
        ...(selected ? {} : { owner: currentOwnerId }),
      };

      if (selected) {
        await axiosInstance.put(`/employees/staff/${selected.id}/`, payload);
      } else {
        await axiosInstance.post('/employees/staff/', payload);
      }

      await fetchEmployees();
      closeModal();
    } catch (e) {
      const msg = e.response?.data
        ? Object.values(e.response.data).flat().join(', ')
        : e.message || 'Save failed';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------
     DELETE
     -------------------------------------------------------------- */
  const openDelete = (emp) => {
    setSelected(emp);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await axiosInstance.delete(`/employees/staff/${selected.id}/`);
      setEmployees(prev => prev.filter(e => e.id !== selected.id));
      setFiltered(prev => prev.filter(e => e.id !== selected.id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  };

  /* --------------------------------------------------------------
     BLOCK / UNBLOCK (PATCH on same URL)
     -------------------------------------------------------------- */
  const openBlockModal = (emp) => {
    setBlockTarget(emp);
    setBlockAction(emp.is_active_employee ? 'block' : 'unblock');
    setBlockOpen(true);
  };

  const confirmBlock = async () => {
    if (!blockTarget) return;
    try {
      const { data } = await axiosInstance.put(
        `/employees/staff/${blockTarget.id}/toggle-active/`,
        { is_active_employee: !blockTarget.is_active_employee }
      );

      setEmployees(prev =>
        prev.map(e =>
          e.id === blockTarget.id
            ? { ...e, is_active_employee: data.is_active_employee }
            : e
        )
      );
      setFiltered(prev =>
        prev.map(e =>
          e.id === blockTarget.id
            ? { ...e, is_active_employee: data.is_active_employee }
            : e
        )
      );
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update status');
    } finally {
      setBlockOpen(false);
      setBlockTarget(null);
    }
  };

  /* --------------------------------------------------------------
     TABLE COLUMNS – Matches Companies Page
     -------------------------------------------------------------- */
  const columns = useMemo(
    () => [
      {
        header: 'Employee ID',
        cell: (row) => <span className="font-mono text-sm">{row.employee_id || '—'}</span>,
      },
      {
        header: 'Name',
        accessor: (row) => row.user?.name || '—',
      },
      { header: 'Role', accessor: 'employee_type' },
      {
        header: 'Phone',
        accessor: (row) => row.user?.phone || '—',
      },
      {
        header: 'Status',
        cell: (row) => (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.is_active_employee
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.is_active_employee ? <CheckCircle size={14} /> : <Ban size={14} />}
            {row.is_active_employee ? 'Active' : 'Blocked'}
          </span>
        ),
      },
      {
        header: 'Actions',
        cell: (row) => (
          <div className="flex items-center gap-3">
            {/* Edit */}
            <button
              onClick={() => openEdit(row)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>

            {/* Delete */}
            <button
              onClick={() => openDelete(row)}
              className="text-red-600 hover:text-red-800 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            {/* Block / Unblock */}
            <button
              onClick={() => openBlockModal(row)}
              className={`transition-colors ${
                row.is_active_employee
                  ? 'text-orange-600 hover:text-orange-800'
                  : 'text-green-600 hover:text-green-800'
              }`}
              title={row.is_active_employee ? 'Block this employee' : 'Unblock this employee'}
            >
              <Ban size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  /* --------------------------------------------------------------
     RENDER
     -------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
      <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <div className="min-w-0 flex-1">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
        Staff Management
      </h1>
      <p className="text-gray-600 text-xs sm:text-sm mt-0.5 line-clamp-2">
        Manage drivers, conductors, mechanics, cleaners & managers
      </p>
    </div>
  </div>
</div>

        {/* API ERROR */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        {/* STATS */}
        <StatsCards
          total={employees.length}
          active={employees.filter(e => e.is_active_employee).length}
          label="Employees"
        />

        {/* ACTION BAR */}
        <ActionBar
          search={search}
          onSearch={setSearch}
          onAdd={openAdd}
          addLabel="Add New Employee"
          searchPlaceholder="Search by name, ID, role, phone..."
        />

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <GenericTable
            rows={filtered}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No employees found"
          />
        </div>

        {/* FORM MODAL */}
        <FormModal
          isOpen={modalOpen}
          onClose={closeModal}
          title={selected ? 'Edit Employee' : 'Add New Employee'}
          icon={Users}
          sections={employeeSections()}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={selected ? 'Update' : 'Create Employee'}
        />

        {/* DELETE CONFIRM */}
        <ConfirmModal
          isOpen={deleteOpen}
          onClose={() => { setDeleteOpen(false); setSelected(null); }}
          onConfirm={confirmDelete}
          loading={loading}
          title="Delete Employee?"
          message={`Are you sure you want to delete ${selected?.user?.name || ''}? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          icon={Trash2}
        />

        {/* BLOCK / UNBLOCK CONFIRM */}
        <ConfirmModal
          isOpen={blockOpen}
          onClose={() => { setBlockOpen(false); setBlockTarget(null); }}
          onConfirm={confirmBlock}
          loading={false}
          title={blockAction === 'block' ? 'Block Employee?' : 'Unblock Employee?'}
          message={
            blockAction === 'block'
              ? `Are you sure you want to block ${blockTarget?.user?.name || ''}? They will lose access.`
              : `Are you sure you want to unblock ${blockTarget?.user?.name || ''}? They will regain access.`
          }
          confirmText={blockAction === 'block' ? 'Block' : 'Unblock'}
          cancelText="Cancel"
          confirmVariant={blockAction === 'block' ? 'warning' : 'success'}
          icon={Ban}
        />
      </div>
    </div>
  );
}
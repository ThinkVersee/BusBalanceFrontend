// app/staff/page.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import { Users, Edit, Trash2, CheckCircle, Ban } from 'lucide-react';

import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

/* ------------------------------------------------------------------
   ZOD SCHEMA
   ------------------------------------------------------------------ */
const employeeSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits').optional().or(z.literal('')),
  employee_type: z.enum(['DRIVER', 'CONDUCTOR', 'MANAGER', 'CLEANER', 'MECHANIC']),
  license_number: z.string().optional(),
  license_expiry: z.string().optional(),
  bus_ids: z.array(z.string()).min(1, 'At least one bus must be assigned'),
  is_active_employee: z.boolean().default(true),
});

/* ------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------ */
export default function StaffManagement() {
  /* -------------------------- STATE -------------------------- */
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockAction, setBlockAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [busLoading, setBusLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(employeeSchema) });

  const currentOwnerId = axiosInstance.defaults.ownerId;
  const watchedRole = watch('employee_type');

  /* -------------------------- HELPERS -------------------------- */
  const sortEmployees = useCallback(emps => {
    return [...emps].sort((a, b) => {
      const idA = a.employee_id || '';
      const idB = b.employee_id || '';
      return idA.localeCompare(idB);
    });
  }, []);

  const fetchEmployees = useCallback(async () => {
    setApiLoading(true);
    try {
      const { data } = await axiosInstance.get('/employees/staff/');
      const sorted = sortEmployees(data);
      setEmployees(sorted);
      setFiltered(sorted);
    } catch (e) {
      setApiError(e.response?.data?.detail || 'Failed to load staff');
    } finally {
      setApiLoading(false);
    }
  }, [sortEmployees]);

  const fetchBuses = useCallback(async () => {
    setBusLoading(true);
    try {
      const { data } = await axiosInstance.get('/buses/buses/');
      setBuses(data);
    } catch (e) {
      setApiError('Failed to load buses');
    } finally {
      setBusLoading(false);
    }
  }, []);

  /* -------------------------- EFFECTS -------------------------- */
  useEffect(() => {
    fetchEmployees();
    fetchBuses();
  }, [fetchEmployees, fetchBuses]);

  useEffect(() => {
    const q = search.toLowerCase();
    const res = employees.filter(e =>
      [e.user?.name, e.user?.email, e.user?.phone, e.employee_id, e.employee_type,
      ...(e.buses?.map(b => b.bus_number) || [])]
        .some(f => f?.toString().toLowerCase().includes(q))
    );
    setFiltered(res);
  }, [search, employees]);

  useEffect(() => {
    if (selected && modalOpen) {
      const busIds = selected.buses?.map(b => b.id.toString()) || [];
      reset({
        name: selected.user?.name || '',
        email: selected.user?.email || '',
        phone: selected.user?.phone || '',
        employee_type: selected.employee_type,
        license_number: selected.license_number || '',
        license_expiry: selected.license_expiry || '',
        is_active_employee: selected.is_active_employee,
        bus_ids: busIds,
      });
    }
  }, [selected, modalOpen, reset]);

  /* -------------------------- MODAL HANDLERS -------------------------- */
  const openAdd = () => {
    if (busLoading) return alert('Please wait while buses are loading...');
    reset({
      name: '',
      email: '',
      phone: '',
      employee_type: '',
      license_number: '',
      license_expiry: '',
      is_active_employee: true,
      bus_ids: [],
    });
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = emp => {
    if (busLoading) return alert('Please wait while buses are loading...');
    setSelected(emp);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    reset();
  };

  /* -------------------------- SUBMIT -------------------------- */
  const onSubmit = async data => {
    setLoading(true);
    try {
      const payload = {
        user: { name: data.name, email: data.email || null, phone: data.phone || '' },
        employee_type: data.employee_type,
        license_number: data.license_number || null,
        license_expiry: data.license_expiry || null,
        is_active_employee: data.is_active_employee,
        bus_ids: data.bus_ids,
        ...(selected ? {} : { owner: currentOwnerId }),
      };

      if (selected) {
        const { data: updated } = await axiosInstance.put(
          `/employees/staff/${selected.id}/`,
          payload
        );
        const updatedList = employees.map(e => (e.id === selected.id ? updated : e));
        const sorted = sortEmployees(updatedList);
        setEmployees(sorted);
        setFiltered(sorted);
      } else {
        await axiosInstance.post('/employees/staff/', payload);
        await fetchEmployees();
      }
      closeModal();
    } catch (e) {
      alert(Object.values(e.response?.data || {}).flat().join(', ') || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------- DELETE -------------------------- */
  const openDelete = emp => {
    setSelected(emp);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await axiosInstance.delete(`/employees/staff/${selected.id}/`);
      const updated = employees.filter(e => e.id !== selected.id);
      const sorted = sortEmployees(updated);
      setEmployees(sorted);
      setFiltered(sorted);
    } catch {
      alert('Delete failed');
    } finally {
      setDeleteOpen(false);
      setSelected(null);
    }
  };

  /* -------------------------- BLOCK / UNBLOCK -------------------------- */
  const openBlockModal = emp => {
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
      const updated = employees.map(e =>
        e.id === blockTarget.id ? { ...e, is_active_employee: data.is_active_employee } : e
      );
      const sorted = sortEmployees(updated);
      setEmployees(sorted);
      setFiltered(sorted);
    } catch {
      alert('Failed');
    } finally {
      setBlockOpen(false);
      setBlockTarget(null);
    }
  };

  /* -------------------------- FORM SECTIONS -------------------------- */
  const employeeSections = useMemo(
    () => [
      {
        title: 'Basic Information',
        fields: [
          { label: 'Full Name', name: 'name', required: true },
          { label: 'Email', name: 'email', type: 'email', required: true },
          { label: 'Phone', name: 'phone', type: 'tel', required: true },
        ],
      },
      {
        title: 'Employment Details',
        fields: [
          {
            label: 'Role',
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
            ].map(opt => ({
              ...opt,
              // This ensures text is dark even in native select on macOS
              ...(opt.value && { className: 'text-gray-900' })
            })),
          },
          {
            label: 'Assigned Buses',
            name: 'bus_ids',
            type: 'multiselect',
            required: true,
            placeholder: busLoading ? 'Loading buses...' : '— Select Buses —',
            options: buses
              .filter(b => b.is_operational !== false)
              .map(b => ({
                value: b.id.toString(),
                label: `${b.bus_name || b.registration_number} (${b.bus_type || 'Standard'})`,
              })),
            disabled: busLoading,
          },
        ],
      },
      {
        title: 'License (Driver only)',
        fields: [
          { label: 'License Number', name: 'license_number' },
          { label: 'License Expiry', name: 'license_expiry', type: 'date' },
        ],
        hidden: watchedRole !== 'DRIVER',
      },
    ],
    [buses, busLoading, watchedRole]
  );

  /* -------------------------- TABLE COLUMNS -------------------------- */
  const columns = useMemo(
    () => [
      {
        header: 'Employee ID',
        cell: row => (
          <span className="font-mono text-sm">{row.employee_id || '—'}</span>
        ),
      },
      { header: 'Name', accessor: row => row.user?.name || '—' },
      { header: 'Role', accessor: 'employee_type' },
      { header: 'Phone', accessor: row => row.user?.phone || '—' },
      { header: 'Email', accessor: row => row.user?.email || '—' },
      {
        header: 'Status',
        cell: row => {
          const active = row.is_active_employee;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
            >
              {active ? <CheckCircle size={14} /> : <Ban size={14} />}
              {active ? 'Active' : 'Blocked'}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        cell: row => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => openEdit(row)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => openDelete(row)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => openBlockModal(row)}
              className={
                row.is_active_employee
                  ? 'text-orange-600 hover:text-orange-800'
                  : 'text-green-600 hover:text-green-800'
              }
              title={row.is_active_employee ? 'Block' : 'Unblock'}
            >
              <Ban size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  /* -------------------------- RENDER -------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Staff Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
                Manage drivers, conductors, mechanics, cleaners & managers
              </p>
            </div>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        {/* Stats + ActionBar */}
        <StatsCards
          total={employees.length}
          active={employees.filter(e => e.is_active_employee).length}
          label="Employees"
        />
        <ActionBar
          search={search}
          onSearch={setSearch}
          onAdd={openAdd}
          addLabel="Add New Employee"
          searchPlaceholder="Search by name, ID, role, phone, bus..."
        />

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <GenericTable
            rows={filtered}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No employees found"
          />
        </div>

        {/* Modals */}
        <FormModal
          isOpen={modalOpen}
          onClose={closeModal}
          title={selected ? 'Edit Employee' : 'Add New Employee'}
          icon={Users}
          sections={employeeSections}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={selected ? 'Update' : 'Create Employee'}
          watch={watch}
          setValue={setValue}
        />

        <ConfirmModal
          isOpen={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            setSelected(null);
          }}
          onConfirm={confirmDelete}
          loading={loading}
          title="Delete Employee?"
          message={`Are you sure you want to delete ${selected?.user?.name || ''}? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          icon={Trash2}
        />

        <ConfirmModal
          isOpen={blockOpen}
          onClose={() => {
            setBlockOpen(false);
            setBlockTarget(null);
          }}
          onConfirm={confirmBlock}
          loading={false}
          title={blockAction === 'block' ? 'Block Employee?' : 'Unblock Employee?'}
          message={
            blockAction === 'block'
              ? `Block ${blockTarget?.user?.name || ''}?`
              : `Unblock ${blockTarget?.user?.name || ''}?`
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
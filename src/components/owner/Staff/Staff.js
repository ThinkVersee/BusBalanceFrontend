'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  bus_ids: z.array(z.string()).optional(),
}).refine(
  (data) => data.employee_type !== 'DRIVER' || (data.license_number && data.license_expiry && (data.bus_ids?.length ?? 0) > 0),
  { message: 'At least one bus required for drivers', path: ['bus_ids'] }
);

/* ------------------------------------------------------------------
   MAIN COMPONENT (Pure JS - No JSX)
   ------------------------------------------------------------------ */
export default function StaffManagement() {
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
    formState: { errors }
  } = useForm({ resolver: zodResolver(employeeSchema) });

  const currentOwnerId = axiosInstance.defaults.ownerId;
  const watchedRole = watch('employee_type');

  /* --------------------------------------------------------------
     LOCAL SORTING (by employee_id)
     -------------------------------------------------------------- */
  const sortEmployees = useCallback((emps) => {
    return [...emps].sort((a, b) => {
      const idA = a.employee_id || '';
      const idB = b.employee_id || '';
      return idA.localeCompare(idB);
    });
  }, []);

  /* --------------------------------------------------------------
     FETCH EMPLOYEES & BUSES
     -------------------------------------------------------------- */
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

  useEffect(() => {
    fetchEmployees();
    fetchBuses();
  }, [fetchEmployees, fetchBuses]);

  /* --------------------------------------------------------------
     SEARCH
     -------------------------------------------------------------- */
  useEffect(() => {
    const q = search.toLowerCase();
    const res = employees.filter(e =>
      [e.user?.name, e.user?.email, e.user?.phone, e.employee_id, e.employee_type,
       ...(e.buses?.map(b => b.bus_number) || [])]
      .some(f => f?.toString().toLowerCase().includes(q))
    );
    setFiltered(res);
  }, [search, employees]);

  /* --------------------------------------------------------------
     FORM POPULATION
     -------------------------------------------------------------- */
  useEffect(() => {
    if (selected && modalOpen) {
      const busIds = selected.buses?.map(b => b.id.toString()) || [];
      reset({
        name: selected.user?.name || '',
        email: selected.user?.email || '',
        phone: selected.user?.phone || '',
        employee_type: selected.employee_type,
        date_of_birth: selected.date_of_birth || '',
        blood_group: selected.blood_group || '',
        emergency_contact_name: selected.emergency_contact_name || '',
        emergency_contact_phone: selected.emergency_contact_phone || '',
        address: selected.address || '',
        salary: selected.salary ?? '',
        license_number: selected.license_number || '',
        license_expiry: selected.license_expiry || '',
        aadhar_number: selected.aadhar_number || '',
        is_active_employee: selected.is_active_employee,
        date_of_joining: selected.date_of_joining,
        bus_ids: busIds,
      });
    }
  }, [selected, modalOpen, reset]);

  /* --------------------------------------------------------------
     MODAL HELPERS
     -------------------------------------------------------------- */
  const today = new Date().toISOString().split('T')[0];

  const openAdd = () => {
    if (busLoading) return alert('Please wait while buses are loading...');
    reset({
      name: '', email: '', phone: '', employee_type: '', date_of_birth: '', blood_group: '',
      emergency_contact_name: '', emergency_contact_phone: '', address: '', salary: '',
      license_number: '', license_expiry: '', aadhar_number: '', is_active_employee: true,
      date_of_joining: today, bus_ids: [],
    });
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    if (busLoading) return alert('Please wait while buses are loading...');
    setSelected(emp);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelected(null);
    reset();
  };

  /* --------------------------------------------------------------
     SUBMIT – Optimistic edit, sorted refetch on create
     -------------------------------------------------------------- */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        user: { name: data.name, email: data.email || null, phone: data.phone || '' },
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
        bus_ids: data.bus_ids || [],
        ...(selected ? {} : { owner: currentOwnerId }),
      };

      if (selected) {
        // EDIT: Optimistic update
        const { data: updatedEmployee } = await axiosInstance.put(
          `/employees/staff/${selected.id}/`,
          payload
        );
        const updatedList = employees.map(e =>
          e.id === selected.id ? updatedEmployee : e
        );
        const sorted = sortEmployees(updatedList);
        setEmployees(sorted);
        setFiltered(sorted);
      } else {
        // CREATE: Refetch
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

  /* --------------------------------------------------------------
     DELETE
     -------------------------------------------------------------- */
  const openDelete = (emp) => { setSelected(emp); setDeleteOpen(true); };
  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await axiosInstance.delete(`/employees/staff/${selected.id}/`);
      const updated = employees.filter(e => e.id !== selected.id);
      const sorted = sortEmployees(updated);
      setEmployees(sorted);
      setFiltered(sorted);
    } catch { alert('Delete failed'); }
    finally { setDeleteOpen(false); setSelected(null); }
  };

  /* --------------------------------------------------------------
     BLOCK / UNBLOCK
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
      const updated = employees.map(e =>
        e.id === blockTarget.id ? { ...e, is_active_employee: data.is_active_employee } : e
      );
      const sorted = sortEmployees(updated);
      setEmployees(sorted);
      setFiltered(sorted);
    } catch { alert('Failed'); }
    finally { setBlockOpen(false); setBlockTarget(null); }
  };

  /* --------------------------------------------------------------
     FORM SECTIONS (for FormModal)
     -------------------------------------------------------------- */
  const employeeSections = useMemo(() => [
    { title: 'Personal Information', fields: [
      { label: 'Full Name *', name: 'name', required: true },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Phone', name: 'phone', type: 'tel' },
      { label: 'Date of Birth', name: 'date_of_birth', type: 'date' },
      { label: 'Blood Group', name: 'blood_group' },
      { label: 'Aadhar Number', name: 'aadhar_number' },
    ]},
    { title: 'Employment Details', fields: [
      { label: 'Role *', name: 'employee_type', type: 'select', required: true, options: [
        { value: '', label: '— Select Role —' },
        { value: 'DRIVER', label: 'Driver' },
        { value: 'CONDUCTOR', label: 'Conductor' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'CLEANER', label: 'Cleaner' },
        { value: 'MECHANIC', label: 'Mechanic' },
      ]},
      { label: 'Salary', name: 'salary', type: 'number', step: '0.01' },
      { label: 'Joining Date *', name: 'date_of_joining', type: 'date', required: true, disabled: true },
      { label: 'Assigned Buses', name: 'bus_ids', type: 'multiselect',
        placeholder: busLoading ? 'Loading buses...' : '— Select Buses —',
        options: buses.filter(b => b.is_operational !== false).map(b => ({
          value: b.id.toString(),
          label: `${b.bus_name || b.registration_number} (${b.bus_type || 'Standard'})`,
        })),
        disabled: busLoading,
      },
    ]},
    { title: 'License (Driver only)', fields: [
      { label: 'License Number', name: 'license_number' },
      { label: 'License Expiry', name: 'license_expiry', type: 'date' },
    ], hidden: watchedRole !== 'DRIVER' },
    { title: 'Address & Emergency', fields: [
      { label: 'Address', name: 'address', type: 'textarea' },
      { label: 'Emergency Contact Name', name: 'emergency_contact_name' },
      { label: 'Emergency Contact Phone', name: 'emergency_contact_phone', type: 'tel' },
    ]},
  ], [buses, busLoading, watchedRole]);

  /* --------------------------------------------------------------
     TABLE COLUMNS
     -------------------------------------------------------------- */
  const columns = useMemo(() => [
    { header: 'Employee ID', cell: row => React.createElement('span', { className: 'font-mono text-sm' }, row.employee_id || '—') },
    { header: 'Name', accessor: row => row.user?.name || '—' },
    { header: 'Role', accessor: 'employee_type' },
    { header: 'Phone', accessor: row => row.user?.phone || '—' },
    { header: 'Email', accessor: row => row.user?.email || '—' },
    { header: 'Status', cell: row => {
      const isActive = row.is_active_employee;
      return React.createElement('span', {
        className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
      },
        isActive ? React.createElement(CheckCircle, { size: 14 }) : React.createElement(Ban, { size: 14 }),
        isActive ? 'Active' : 'Blocked'
      );
    }},
    { header: 'Actions', cell: row => React.createElement('div', { className: 'flex items-center gap-3' },
      React.createElement('button', { onClick: () => openEdit(row), className: 'text-blue-600 hover:text-blue-800', title: 'Edit' }, React.createElement(Edit, { size: 16 })),
      React.createElement('button', { onClick: () => openDelete(row), className: 'text-red-600 hover:text-red-800', title: 'Delete' }, React.createElement(Trash2, { size: 16 })),
      React.createElement('button', {
        onClick: () => openBlockModal(row),
        className: row.is_active_employee ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800',
        title: row.is_active_employee ? 'Block' : 'Unblock'
      }, React.createElement(Ban, { size: 16 }))
    )},
  ], [openEdit, openDelete, openBlockModal]);

  /* --------------------------------------------------------------
     RENDER (Pure JS with React.createElement)
     -------------------------------------------------------------- */
  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8' },
    React.createElement('div', { className: 'max-w-7xl mx-auto' },

      // Header
      React.createElement('div', { className: 'flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg' },
            React.createElement(Users, { className: 'text-white w-5 h-5 sm:w-6 sm:h-6' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900' }, 'Staff Management'),
            React.createElement('p', { className: 'text-gray-600 text-xs sm:text-sm mt-0.5' }, 'Manage drivers, conductors, mechanics, cleaners & managers')
          )
        )
      ),

      // Error
      apiError && React.createElement('div', { className: 'bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm' }, apiError),

      // Stats + Action Bar
      React.createElement(StatsCards, { total: employees.length, active: employees.filter(e => e.is_active_employee).length, label: 'Employees' }),
      React.createElement(ActionBar, { search, onSearch: setSearch, onAdd: openAdd, addLabel: 'Add New Employee', searchPlaceholder: 'Search by name, ID, role, phone, bus...' }),

      // Table
      React.createElement('div', { className: 'bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100' },
        React.createElement(GenericTable, { rows: filtered, columns, loading: apiLoading, emptyMessage: 'No employees found' })
      ),

      // Modals
      React.createElement(FormModal, {
        isOpen: modalOpen,
        onClose: closeModal,
        title: selected ? 'Edit Employee' : 'Add New Employee',
        icon: Users,
        sections: employeeSections,
        register,
        errors,
        onSubmit: handleSubmit(onSubmit),
        loading,
        submitLabel: selected ? 'Update' : 'Create Employee',
        watch,
        setValue
      }),

      React.createElement(ConfirmModal, {
        isOpen: deleteOpen,
        onClose: () => { setDeleteOpen(false); setSelected(null); },
        onConfirm: confirmDelete,
        loading,
        title: 'Delete Employee?',
        message: `Are you sure you want to delete ${selected?.user?.name || ''}? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmVariant: 'danger',
        icon: Trash2
      }),

      React.createElement(ConfirmModal, {
        isOpen: blockOpen,
        onClose: () => { setBlockOpen(false); setBlockTarget(null); },
        onConfirm: confirmBlock,
        loading: false,
        title: blockAction === 'block' ? 'Block Employee?' : 'Unblock Employee?',
        message: blockAction === 'block' ? `Block ${blockTarget?.user?.name || ''}?` : `Unblock ${blockTarget?.user?.name || ''}?`,
        confirmText: blockAction === 'block' ? 'Block' : 'Unblock',
        cancelText: 'Cancel',
        confirmVariant: blockAction === 'block' ? 'warning' : 'success',
        icon: Ban
      })
    )
  );
}
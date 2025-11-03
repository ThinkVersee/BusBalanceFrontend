'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import { Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

// ---------------------------------------------------------------------
// ZOD SCHEMA – NO owner_id, employee_id, date_of_joining
// ---------------------------------------------------------------------
const employeeSchema = z.object({
  employee_type: z.enum(['DRIVER', 'CONDUCTOR', 'MANAGER', 'CLEANER', 'MECHANIC']),
  salary: z.coerce.number().optional(),
  date_of_birth: z.string().optional(),
  blood_group: z.string().max(5).optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().max(15).optional(),
  address: z.string().optional(),
  license_number: z.string().optional(),
  license_expiry: z.string().optional(),
  aadhar_number: z.string().max(12).optional(),
  is_active_employee: z.boolean().default(true),
}).refine(
  (data) =>
    data.employee_type !== 'DRIVER' ||
    (data.license_number?.trim() && data.license_expiry),
  {
    message: 'License number & expiry required for drivers',
    path: ['license_number'],
  }
);

// ---------------------------------------------------------------------
// FORM SECTIONS – CLEAN, NO OWNER/ID/JOINING
// ---------------------------------------------------------------------
const employeeSections = [
  {
    title: 'Basic Info',
    fields: [
      {
        label: 'Employee Type',
        name: 'employee_type',
        type: 'select',
        required: true,
        options: [
          { value: '', label: '— Select Type —' },
          { value: 'DRIVER', label: 'Driver' },
          { value: 'CONDUCTOR', label: 'Conductor' },
          { value: 'MANAGER', label: 'Manager' },
          { value: 'CLEANER', label: 'Cleaner' },
          { value: 'MECHANIC', label: 'Mechanic' },
        ],
      },
    ],
  },
  {
    title: 'Personal Details',
    fields: [
      { label: 'Date of Birth', name: 'date_of_birth', type: 'date' },
      { label: 'Blood Group', name: 'blood_group', placeholder: 'e.g. O+' },
      { label: 'Emergency Contact Name', name: 'emergency_contact_name' },
      { label: 'Emergency Contact Phone', name: 'emergency_contact_phone' },
      { label: 'Address', name: 'address', type: 'textarea' },
    ],
  },
  {
    title: 'Employment',
    fields: [
      { label: 'Salary (₹)', name: 'salary', type: 'number' },
    ],
  },
  {
    title: 'Documents',
    fields: [
      { label: 'Aadhar Number', name: 'aadhar_number' },
      {
        label: 'License Number (Driver only)',
        name: 'license_number',
        placeholder: 'Required for drivers',
      },
      {
        label: 'License Expiry (Driver only)',
        name: 'license_expiry',
        type: 'date',
      },
    ],
  },
];

// ---------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------
export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
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
    defaultValues: {
      employee_type: '',
      salary: '',
      date_of_birth: '',
      blood_group: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
      license_number: '',
      license_expiry: '',
      aadhar_number: '',
      is_active_employee: true,
    },
  });

  const employeeType = watch('employee_type');

  // -----------------------------------------------------------------
  // FETCH EMPLOYEES
  // -----------------------------------------------------------------
  const fetchEmployees = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosInstance.get('/employees/staff/');
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (e) {
      setApiError(e.response?.data?.detail || 'Failed to load employees');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // -----------------------------------------------------------------
  // SEARCH
  // -----------------------------------------------------------------
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredEmployees(employees);
      return;
    }
    const filtered = employees.filter((emp) =>
      [emp.employee_id, emp.user?.name, emp.employee_type]
        .some(f => f?.toLowerCase().includes(q))
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // -----------------------------------------------------------------
  // FORM HANDLERS
  // -----------------------------------------------------------------
  const resetForm = () => {
    reset();
    setSelectedEmp(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (emp) => {
    setSelectedEmp(emp);
    setValue('employee_type', emp.employee_type);
    setValue('salary', emp.salary || '');
    setValue('date_of_birth', emp.date_of_birth || '');
    setValue('blood_group', emp.blood_group || '');
    setValue('emergency_contact_name', emp.emergency_contact_name || '');
    setValue('emergency_contact_phone', emp.emergency_contact_phone || '');
    setValue('address', emp.address || '');
    setValue('license_number', emp.license_number || '');
    setValue('license_expiry', emp.license_expiry || '');
    setValue('aadhar_number', emp.aadhar_number || '');
    setValue('is_active_employee', emp.is_active_employee ?? true);
    setIsModalOpen(true);
  };

  // -----------------------------------------------------------------
  // SUBMIT – NO owner/id/joining
  // -----------------------------------------------------------------
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        employee_type: data.employee_type,
        is_active_employee: data.is_active_employee,
        ...(data.salary && { salary: Number(data.salary) }),
        ...(data.date_of_birth && { date_of_birth: data.date_of_birth }),
        ...(data.blood_group?.trim() && { blood_group: data.blood_group.trim() }),
        ...(data.emergency_contact_name?.trim() && { emergency_contact_name: data.emergency_contact_name.trim() }),
        ...(data.emergency_contact_phone?.trim() && { emergency_contact_phone: data.emergency_contact_phone.trim() }),
        ...(data.address?.trim() && { address: data.address.trim() }),
        ...(data.license_number?.trim() && { license_number: data.license_number.trim() }),
        ...(data.license_expiry && { license_expiry: data.license_expiry }),
        ...(data.aadhar_number?.trim() && { aadhar_number: data.aadhar_number.trim() }),
      };

      if (selectedEmp) {
        await axiosInstance.put(`/employees/staff/${selectedEmp.id}/`, payload);
      } else {
        await axiosInstance.post('/employees/staff/', payload);
      }

      await fetchEmployees();
      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      alert(Object.values(e.response?.data || {}).flat().join(', ') || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // DELETE & TOGGLE
  // -----------------------------------------------------------------
  const openDelete = (emp) => {
    setSelectedEmp(emp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    await axiosInstance.delete(`/employees/staff/${selectedEmp.id}/`);
    await fetchEmployees();
    setIsDeleteOpen(false);
    setSelectedEmp(null);
  };

  const openToggleConfirm = (emp) => {
    setToggleTarget(emp);
    setIsToggleOpen(true);
  };

  const confirmToggle = async () => {
    await axiosInstance.patch(`/employees/staff/${toggleTarget.id}/toggle-active/`, {});
    await fetchEmployees();
    setIsToggleOpen(false);
    setToggleTarget(null);
  };

  // -----------------------------------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------------------------------
  const columns = useMemo(() => [
    { header: 'Emp ID', accessor: 'employee_id' },
    { header: 'Name', cell: (row) => row.user?.name || '—' },
    { header: 'Type', cell: (row) => row.employee_type },
    { header: 'Joining', accessor: 'date_of_joining' },
    {
      header: 'Active',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${row.is_active_employee ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {row.is_active_employee ? 'Yes' : 'No'}
          </span>
          <button onClick={() => openToggleConfirm(row)} className="p-1">
            {row.is_active_employee ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-600" />}
          </button>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row)} className="text-blue-600"><Edit size={16} /></button>
          <button onClick={() => openDelete(row)} className="text-red-600"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ], []);

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-gray-600">Add and manage your staff</p>
          </div>
        </div>

        {apiError && <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{apiError}</div>}

        <StatsCards
          total={employees.length}
          operational={employees.filter(e => e.is_active_employee).length}
          label="Total Staff"
          operationalLabel="Active"
        />

        <ActionBar
          search={searchQuery}
          onSearch={setSearchQuery}
          onAdd={handleAdd}
          addLabel="Add Employee"
          searchPlaceholder="Search by ID, name, type..."
        />

        <GenericTable
          rows={filteredEmployees}
          columns={columns}
          loading={apiLoading}
          emptyMessage="No employees yet. Click 'Add Employee' to start."
        />

        {/* ADD / EDIT MODAL */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); resetForm(); }}
          title={selectedEmp ? 'Edit Employee' : 'Add New Employee'}
          icon={Users}
          sections={employeeSections}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={selectedEmp ? 'Update' : 'Create'}
        />

        {/* DELETE CONFIRM */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => { setIsDeleteOpen(false); setSelectedEmp(null); }}
          onConfirm={confirmDelete}
          title="Delete Employee?"
          message={`Delete ${selectedEmp?.user?.name || ''} (${selectedEmp?.employee_id})?`}
          confirmText="Delete"
          confirmVariant="danger"
          icon={Trash2}
        />

        {/* TOGGLE ACTIVE */}
        <ConfirmModal
          isOpen={isToggleOpen}
          onClose={() => { setIsToggleOpen(false); setToggleTarget(null); }}
          onConfirm={confirmToggle}
          title={toggleTarget?.is_active_employee ? 'Deactivate?' : 'Activate?'}
          message={`${toggleTarget?.is_active_employee ? 'Deactivate' : 'Activate'} ${toggleTarget?.user?.name}?`}
          confirmText={toggleTarget?.is_active_employee ? 'Deactivate' : 'Activate'}
          confirmVariant={toggleTarget?.is_active_employee ? 'warning' : 'success'}
          icon={toggleTarget?.is_active_employee ? XCircle : CheckCircle}
        />
      </div>
    </div>
  );
}
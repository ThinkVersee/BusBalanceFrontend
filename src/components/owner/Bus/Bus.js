'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import { Bus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

// ---------- ZOD SCHEMA (NO owner_id) ----------
const busSchema = z.object({
  registration_number: z.string().min(1, 'Registration number required').max(20, 'Max 20 characters'),
  bus_name: z.string().min(1, 'Bus name required'),
  route: z.string().min(1, 'Primary route required'),
  bus_type: z.enum(['AC_SLEEPER', 'NON_AC_SLEEPER', 'AC_SEATER', 'NON_AC_SEATER', 'SEMI_SLEEPER', 'VOLVO', 'ORDINARY']).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  year_of_manufacture: z.coerce.number().int().optional(),
  seating_capacity: z.coerce.number().int().min(1).optional(),
  chassis_number: z.string().optional(),
  engine_number: z.string().optional(),
  permit_number: z.string().optional(),
  permit_expiry: z.string().optional(),
  insurance_number: z.string().optional(),
  insurance_expiry: z.string().optional(),
  fitness_certificate_expiry: z.string().optional(),
  is_operational: z.boolean().default(true),
});

// ---------- FORM SECTIONS (NO owner dropdown) ----------
const busSections = () => [
  {
    title: 'Basic Info',
    fields: [
      { label: 'Registration Number', name: 'registration_number', required: true },
      { label: 'Bus Name', name: 'bus_name', required: true },
      { label: 'Primary Route', name: 'route', required: true, colSpan: 'col-span-1 sm:col-span-2' },
      { label: 'Seating Capacity', name: 'seating_capacity', type: 'number', required: true },
      {
        label: 'Bus Type',
        name: 'bus_type',
        type: 'select',
        required: true,
        options: [
          { value: '', label: '— Select Type —' },
          { value: 'ORDINARY', label: 'Ordinary' },
          { value: 'AC_SLEEPER', label: 'AC Sleeper' },
          { value: 'NON_AC_SLEEPER', label: 'Non-AC Sleeper' },
          { value: 'AC_SEATER', label: 'AC Seater' },
          { value: 'NON_AC_SEATER', label: 'Non-AC Seater' },
          { value: 'SEMI_SLEEPER', label: 'Semi Sleeper' },
          { value: 'VOLVO', label: 'Volvo' },
        ]
      },
    ],
  },
  {
    title: 'Optional Specifications',
    fields: [

      { label: 'Manufacturer', name: 'manufacturer' },
      { label: 'Model', name: 'model' },
      { label: 'Year of Manufacture', name: 'year_of_manufacture', type: 'number' },
      { label: 'Chassis Number', name: 'chassis_number' },
      { label: 'Engine Number', name: 'engine_number' },
    ],
  },
  {
    title: 'Optional Documents & Permits',
    fields: [
      { label: 'Permit Number', name: 'permit_number' },
      { label: 'Permit Expiry', name: 'permit_expiry', type: 'date' },
      { label: 'Insurance Number', name: 'insurance_number' },
      { label: 'Insurance Expiry', name: 'insurance_expiry', type: 'date' },
      { label: 'Fitness Certificate Expiry', name: 'fitness_certificate_expiry', type: 'date' },
    ],
  },
];

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isToggleOpOpen, setIsToggleOpOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const currentOwnerId = axiosInstance.defaults.ownerId; // From login

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(busSchema),
    defaultValues: {
      is_operational: true,
      registration_number: '',
      bus_name: '',
      route: '',
    }
  });

  // -----------------------------------------------------------------
  // FETCH BUSES (only owner's buses)
  // -----------------------------------------------------------------
  const fetchBuses = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosInstance.get('/buses/buses/');
      setBuses(data || []);
      setFilteredBuses(data || []);
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Failed to load buses';
      setApiError(msg);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  // -----------------------------------------------------------------
  // SEARCH FILTER
  // -----------------------------------------------------------------
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredBuses(buses);
      return;
    }

    const filtered = buses.filter(bus =>
      [
        bus.registration_number,
        bus.bus_name,
        bus.route,
        bus.manufacturer,
        bus.model,
      ].some(field => field?.toLowerCase().includes(q))
    );
    setFilteredBuses(filtered);
  }, [searchQuery, buses]);

  // -----------------------------------------------------------------
  // FORM HANDLERS
  // -----------------------------------------------------------------
  const resetForm = () => {
    reset({
      registration_number: '',
      bus_name: '',
      route: '',
      bus_type: '',
      manufacturer: '',
      model: '',
      year_of_manufacture: '',
      seating_capacity: '',
      chassis_number: '',
      engine_number: '',
      permit_number: '',
      permit_expiry: '',
      insurance_number: '',
      insurance_expiry: '',
      fitness_certificate_expiry: '',
      is_operational: true,
    });
    setSelectedBus(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (bus) => {
    setSelectedBus(bus);
    setValue('registration_number', bus.registration_number || '');
    setValue('bus_name', bus.bus_name || '');
    setValue('route', bus.route || '');
    setValue('bus_type', bus.bus_type || '');
    setValue('manufacturer', bus.manufacturer || '');
    setValue('model', bus.model || '');
    setValue('year_of_manufacture', bus.year_of_manufacture || '');
    setValue('seating_capacity', bus.seating_capacity || '');
    setValue('chassis_number', bus.chassis_number || '');
    setValue('engine_number', bus.engine_number || '');
    setValue('permit_number', bus.permit_number || '');
    setValue('permit_expiry', bus.permit_expiry || '');
    setValue('insurance_number', bus.insurance_number || '');
    setValue('insurance_expiry', bus.insurance_expiry || '');
    setValue('fitness_certificate_expiry', bus.fitness_certificate_expiry || '');
    setValue('is_operational', bus.is_operational ?? true);
    setIsModalOpen(true);
  };

  // -----------------------------------------------------------------
  // SUBMIT (Create / Edit)
  // -----------------------------------------------------------------
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        registration_number: data.registration_number.trim(),
        bus_name: data.bus_name.trim(),
        route: data.route.trim(),
        is_operational: data.is_operational,
        ...(data.bus_type && { bus_type: data.bus_type }),
        ...(data.manufacturer?.trim() && { manufacturer: data.manufacturer.trim() }),
        ...(data.model?.trim() && { model: data.model.trim() }),
        ...(data.year_of_manufacture && { year_of_manufacture: Number(data.year_of_manufacture) }),
        ...(data.seating_capacity && { seating_capacity: Number(data.seating_capacity) }),
        ...(data.chassis_number?.trim() && { chassis_number: data.chassis_number.trim() }),
        ...(data.engine_number?.trim() && { engine_number: data.engine_number.trim() }),
        ...(data.permit_number?.trim() && { permit_number: data.permit_number.trim() }),
        ...(data.permit_expiry && { permit_expiry: data.permit_expiry }),
        ...(data.insurance_number?.trim() && { insurance_number: data.insurance_number.trim() }),
        ...(data.insurance_expiry && { insurance_expiry: data.insurance_expiry }),
        ...(data.fitness_certificate_expiry && { fitness_certificate_expiry: data.fitness_certificate_expiry }),

        // Only on CREATE
        ...(!selectedBus && { owner: currentOwnerId }),
      };

      if (selectedBus) {
        await axiosInstance.put(`/buses/buses/${selectedBus.id}/`, payload);
      } else {
        await axiosInstance.post('/buses/buses/', payload);
      }

      await fetchBuses();
      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      const msg = e.response?.data
        ? Object.values(e.response.data).flat().join(', ')
        : e.message || 'Operation failed';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // DELETE
  // -----------------------------------------------------------------
  const openDelete = (bus) => {
    setSelectedBus(bus);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBus) return;
    try {
      await axiosInstance.delete(`/buses/buses/${selectedBus.id}/`);
      setBuses(prev => prev.filter(b => b.id !== selectedBus.id));
      setFilteredBuses(prev => prev.filter(b => b.id !== selectedBus.id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete bus');
    } finally {
      setIsDeleteOpen(false);
      setSelectedBus(null);
    }
  };

  // -----------------------------------------------------------------
  // TOGGLE OPERATIONAL
  // -----------------------------------------------------------------
  const openToggleConfirm = (bus) => {
    setToggleTarget(bus);
    setIsToggleOpOpen(true);
  };

  const confirmToggle = async () => {
    if (!toggleTarget) return;
    try {
      const { data } = await axiosInstance.patch(`/buses/buses/${toggleTarget.id}/`, {
        is_operational: !toggleTarget.is_operational,
      });
      setBuses(prev => prev.map(b => b.id === toggleTarget.id ? { ...b, is_operational: data.is_operational } : b));
      setFilteredBuses(prev => prev.map(b => b.id === toggleTarget.id ? { ...b, is_operational: data.is_operational } : b));
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setIsToggleOpOpen(false);
      setToggleTarget(null);
    }
  };

  // -----------------------------------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------------------------------
  const columns = useMemo(() => [
    { header: 'Reg. No.', accessor: 'registration_number' },
    { header: 'Name', accessor: 'bus_name' },
    { header: 'Route', accessor: 'route', cell: row => <span className="text-sm">{row.route || '—'}</span> },
    {
      header: 'Type',
      cell: row => (
        <span className="text-xs font-medium text-gray-700">
          {row.bus_type ? row.bus_type.replace('_', ' ') : '—'}
        </span>
      )
    },
    {
      header: 'Operational',
      cell: row => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${row.is_operational ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {row.is_operational ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {row.is_operational ? 'Yes' : 'No'}
          </span>
          <button
            onClick={() => openToggleConfirm(row)}
            className={`p-1 rounded transition-colors ${row.is_operational ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
              }`}
            title={row.is_operational ? 'Mark as Non-Operational' : 'Mark as Operational'}
          >
            {row.is_operational ? <CheckCircle size={16} /> : <XCircle size={16} />}
          </button>
        </div>
      )
    },
    {
      header: 'Actions',
      cell: row => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openDelete(row)}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ], []);

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon - scales down on mobile */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Bus className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {/* Text Content */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Bus Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 line-clamp-2">
                Manage your buses and operational status
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

        {/* Stats */}
        <StatsCards
          total={buses.length}
          operational={buses.filter(b => b.is_operational).length}
          label="Buses"
        />

        {/* Action Bar */}
        <ActionBar
          search={searchQuery}
          onSearch={setSearchQuery}
          onAdd={handleAdd}
          addLabel="Add New Bus"
          searchPlaceholder="Search by reg. no., name, route..."
        />

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <GenericTable
            rows={filteredBuses}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No buses found"
          />
        </div>

        {/* Form Modal */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); resetForm(); }}
          title={selectedBus ? 'Edit Bus' : 'Add New Bus'}
          icon={Bus}
          sections={busSections()}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={selectedBus ? 'Update' : 'Create Bus'}
        />

        {/* Delete Confirm */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => { setIsDeleteOpen(false); setSelectedBus(null); }}
          onConfirm={confirmDelete}
          loading={loading}
          title="Delete Bus?"
          message={`Are you sure you want to delete "${selectedBus?.bus_name || ''}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          icon={Trash2}
        />

        {/* Toggle Operational */}
        <ConfirmModal
          isOpen={isToggleOpOpen}
          onClose={() => { setIsToggleOpOpen(false); setToggleTarget(null); }}
          onConfirm={confirmToggle}
          loading={false}
          title={toggleTarget?.is_operational ? 'Mark as Non-Operational?' : 'Mark as Operational?'}
          message={
            toggleTarget?.is_operational
              ? `Are you sure you want to mark "${toggleTarget?.bus_name}" as non-operational?`
              : `Are you sure you want to mark "${toggleTarget?.bus_name}" as operational?`
          }
          confirmText={toggleTarget?.is_operational ? 'Mark Non-Operational' : 'Mark Operational'}
          cancelText="Cancel"
          confirmVariant={toggleTarget?.is_operational ? 'warning' : 'success'}
          icon={toggleTarget?.is_operational ? XCircle : CheckCircle}
        />
      </div>
    </div>
  );
}
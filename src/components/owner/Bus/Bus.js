'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import { Bus, Edit, Trash2, CheckCircle, XCircle, Percent } from 'lucide-react';
import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';

// ── SCHEMAS ────────────────────────────────────────────────────────────────
const busBasicSchema = z.object({
  registration_number: z.string().min(1, 'Registration number required').max(20),
  bus_name: z.string().min(1, 'Bus name required'),
  route: z.string().min(1, 'Primary route required'),
  bus_type: z
    .enum([
      'AC_SLEEPER',
      'NON_AC_SLEEPER',
      'AC_SEATER',
      'NON_AC_SEATER',
      'SEMI_SLEEPER',
      'VOLVO',
      'ORDINARY',
    ])
    .optional()
    .nullable(),
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year_of_manufacture: z.coerce.number().int().optional().nullable(),
  seating_capacity: z.coerce.number().int().min(1).optional().nullable(),
  chassis_number: z.string().optional().nullable(),
  engine_number: z.string().optional().nullable(),
  permit_number: z.string().optional().nullable(),
  permit_expiry: z.string().optional().nullable(),
  insurance_number: z.string().optional().nullable(),
  insurance_expiry: z.string().optional().nullable(),
  fitness_certificate_expiry: z.string().optional().nullable(),
  is_operational: z.boolean().default(true),
});

const batthaSchema = z.object({
  driver_battha: z.coerce.number().min(0, 'Must be ≥ 0').max(100, 'Cannot exceed 100').default(0),
  conductor_battha: z.coerce.number().min(0, 'Must be ≥ 0').max(100, 'Cannot exceed 100').default(0),
  cleaner_battha: z.coerce.number().min(0, 'Must be ≥ 0').max(100, 'Cannot exceed 100').default(0),
});

// Combined schema for single API call
const busWithBatthaSchema = z.object({
  ...busBasicSchema.shape,
  battha_configs: z.array(z.object({
    employee_type: z.string(),
    percentage: z.number(),
    effective_from: z.string().optional(),
  })).optional(),
});

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isToggleOpOpen, setIsToggleOpOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // ── FORMS ────────────────────────────────────────────────────────────────
  const basicForm = useForm({
    resolver: zodResolver(busBasicSchema),
    defaultValues: {
      registration_number: '',
      bus_name: '',
      route: '',
      bus_type: null,
      manufacturer: null,
      model: null,
      year_of_manufacture: null,
      seating_capacity: null,
      chassis_number: null,
      engine_number: null,
      permit_number: null,
      permit_expiry: null,
      insurance_number: null,
      insurance_expiry: null,
      fitness_certificate_expiry: null,
      is_operational: true,
    },
    mode: 'onChange',
  });

  const batthaForm = useForm({
    resolver: zodResolver(batthaSchema),
    defaultValues: {
      driver_battha: 0,
      conductor_battha: 0,
      cleaner_battha: 0,
    },
    mode: 'onChange',
  });

  const { register: registerBasic, handleSubmit: handleBasicSubmit, reset: resetBasic, watch: watchBasic, setValue: setBasicValue, getValues: getBasicValues } = basicForm;
  const { register: registerBattha, handleSubmit: handleBatthaSubmit, reset: resetBattha, watch: watchBattha, formState: batthaFormState } = batthaForm;

  // Auto uppercase registration number
  const regNumber = watchBasic('registration_number');
  useEffect(() => {
    if (regNumber !== undefined && regNumber !== null) {
      const upper = regNumber.toUpperCase();
      if (regNumber !== upper) {
        setBasicValue('registration_number', upper, { shouldValidate: true });
      }
    }
  }, [regNumber, setBasicValue]);

  // ── FETCH BUSES ─────────────────────────────────────────────────────────
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

  // ── SEARCH FILTER ───────────────────────────────────────────────────────
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredBuses(buses);
      return;
    }
    const filtered = buses.filter((bus) =>
      [bus.registration_number, bus.bus_name, bus.route, bus.manufacturer, bus.model]
        .some((field) => field?.toLowerCase().includes(q))
    );
    setFilteredBuses(filtered);
  }, [searchQuery, buses]);

  // ── HELPER: Clean payload ───────────────────────────────────────────────
  const cleanPayload = (data) => {
    const cleaned = { ...data };

    // Convert empty strings to null for optional fields
    const nullableFields = [
      'bus_type',
      'manufacturer',
      'model',
      'year_of_manufacture',
      'seating_capacity',
      'chassis_number',
      'engine_number',
      'permit_number',
      'permit_expiry',
      'insurance_number',
      'insurance_expiry',
      'fitness_certificate_expiry',
    ];

    nullableFields.forEach((field) => {
      if (cleaned[field] === '' || cleaned[field] === undefined) {
        cleaned[field] = null;
      }
    });

    // Handle numbers properly
    if (cleaned.year_of_manufacture) {
      cleaned.year_of_manufacture = Number(cleaned.year_of_manufacture);
    }
    if (cleaned.seating_capacity) {
      cleaned.seating_capacity = Number(cleaned.seating_capacity);
    }

    return cleaned;
  };

  // ── MODAL / FORM HANDLERS ───────────────────────────────────────────────
  const resetForms = () => {
    resetBasic({
      registration_number: '',
      bus_name: '',
      route: '',
      bus_type: null,
      manufacturer: null,
      model: null,
      year_of_manufacture: null,
      seating_capacity: null,
      chassis_number: null,
      engine_number: null,
      permit_number: null,
      permit_expiry: null,
      insurance_number: null,
      insurance_expiry: null,
      fitness_certificate_expiry: null,
      is_operational: true,
    });
    resetBattha({
      driver_battha: 0,
      conductor_battha: 0,
      cleaner_battha: 0,
    });
    setSelectedBus(null);
    setCurrentStep(1);
  };

  const handleAdd = () => {
    resetForms();
    setIsModalOpen(true);
    setCurrentStep(1);
  };

const handleEdit = (bus) => {
  setSelectedBus(bus);

  // RESET basic form with bus data
  resetBasic({
    registration_number: bus.registration_number || '',
    bus_name: bus.bus_name || '',
    route: bus.route || '',
    bus_type: bus.bus_type || null,
    manufacturer: bus.manufacturer || null,
    model: bus.model || null,
    year_of_manufacture: bus.year_of_manufacture || null,
    seating_capacity: bus.seating_capacity || null,
    chassis_number: bus.chassis_number || null,
    engine_number: bus.engine_number || null,
    permit_number: bus.permit_number || null,
    permit_expiry: bus.permit_expiry || null,
    insurance_number: bus.insurance_number || null,
    insurance_expiry: bus.insurance_expiry || null,
    fitness_certificate_expiry: bus.fitness_certificate_expiry || null,
    is_operational: bus.is_operational ?? true,
  });

  // RESET battha form
  resetBattha({
    driver_battha: 0,
    conductor_battha: 0,
    cleaner_battha: 0,
  });

  if (bus.battha_configs?.length) {
    bus.battha_configs.forEach((config) => {
      if (config.employee_type === 'DRIVER') {
        batthaForm.setValue('driver_battha', Number(config.percentage));
      }
      if (config.employee_type === 'CONDUCTOR') {
        batthaForm.setValue('conductor_battha', Number(config.percentage));
      }
      if (config.employee_type === 'CLEANER') {
        batthaForm.setValue('cleaner_battha', Number(config.percentage));
      }
    });
  }

  setCurrentStep(1);
  setIsModalOpen(true);
};


  // ── SUBMIT LOGIC (SINGLE API CALL) ──────────────────────────────────────
  const onSubmitBasic = async (data) => {
    if (selectedBus) {
      // Edit mode - update bus only (battha configs handled separately)
      await submitBusUpdate(data);
      setIsModalOpen(false);
      resetForms();
    } else {
      // Create mode - go to commission step
      setCurrentStep(2);
    }
  };

  const onSubmitBattha = async (batthaData) => {
    try {
      setLoading(true);

      // 1. Prepare bus payload
      const rawBasic = getBasicValues();
      const busPayload = cleanPayload({
        ...rawBasic,
        registration_number: rawBasic.registration_number?.trim().toUpperCase() || null,
        bus_name: rawBasic.bus_name?.trim() || null,
        route: rawBasic.route?.trim() || null,
        is_operational: rawBasic.is_operational ?? true,
      });

      // 2. Prepare battha configs
      const batthaConfigs = [
        { employee_type: 'DRIVER', percentage: batthaData.driver_battha },
        { employee_type: 'CONDUCTOR', percentage: batthaData.conductor_battha },
        { employee_type: 'CLEANER', percentage: batthaData.cleaner_battha },
      ]
      .filter((cfg) => cfg.percentage > 0) // Filter out zero percentages
      .map((cfg) => ({
        employee_type: cfg.employee_type,
        percentage: cfg.percentage,
        effective_from: new Date().toISOString().split('T')[0],
      }));

      // 3. Combine and send single request
      const combinedPayload = {
        ...busPayload,
        battha_configs: batthaConfigs,
      };

      // 4. Send single POST request
      await axiosInstance.post('/buses/buses/', combinedPayload);
      
      // 5. Refresh data and close modal
      await fetchBuses();
      setIsModalOpen(false);
      resetForms();
      
    } catch (e) {
      console.error('Create bus error:', e);
      const errorData = e.response?.data;
      
      if (errorData) {
        // Handle validation errors
        if (typeof errorData === 'object') {
          const errorMessages = [];
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else if (typeof messages === 'string') {
              errorMessages.push(`${field}: ${messages}`);
            }
          });
          alert(errorMessages.join('\n') || 'Failed to create bus');
        } else {
          alert(errorData.detail || 'Failed to create bus');
        }
      } else {
        alert(e.message || 'Failed to create bus');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitBusUpdate = async (data) => {
    try {
      setLoading(true);

      const cleanedPayload = cleanPayload({
        registration_number: data.registration_number?.trim().toUpperCase() || null,
        bus_name: data.bus_name?.trim() || null,
        route: data.route?.trim() || null,
        is_operational: data.is_operational ?? true,
        ...data,
      });

      await axiosInstance.put(`/buses/buses/${selectedBus.id}/`, cleanedPayload);
      await fetchBuses();
    } catch (e) {
      const errorData = e.response?.data;
      if (errorData) {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(errorMessages || 'Failed to update bus');
      } else {
        alert(e.message || 'Failed to update bus');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE & TOGGLE ─────────────────────────────────────────────────────
  const openDelete = (bus) => {
    setSelectedBus(bus);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBus) return;
    try {
      await axiosInstance.delete(`/buses/buses/${selectedBus.id}/`);
      setBuses((prev) => prev.filter((b) => b.id !== selectedBus.id));
      setFilteredBuses((prev) => prev.filter((b) => b.id !== selectedBus.id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to delete bus');
    } finally {
      setIsDeleteOpen(false);
      setSelectedBus(null);
    }
  };

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
      setBuses((prev) =>
        prev.map((b) => (b.id === toggleTarget.id ? { ...b, is_operational: data.is_operational } : b))
      );
      setFilteredBuses((prev) =>
        prev.map((b) => (b.id === toggleTarget.id ? { ...b, is_operational: data.is_operational } : b))
      );
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setIsToggleOpOpen(false);
      setToggleTarget(null);
    }
  };

  // ── FORM SECTIONS ───────────────────────────────────────────────────────
  const basicSections = () => [
    {
      title: 'Basic Information',
      fields: [
        { label: 'Registration Number', name: 'registration_number', required: true, placeholder: 'MH14AB1234', hint: 'Uppercase auto' },
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
          ],
        },
      ],
    },
    {
      title: 'Additional Specifications (optional)',
      fields: [
        { label: 'Manufacturer', name: 'manufacturer' },
        { label: 'Model', name: 'model' },
        { label: 'Year of Manufacture', name: 'year_of_manufacture', type: 'number' },
        { label: 'Chassis Number', name: 'chassis_number' },
        { label: 'Engine Number', name: 'engine_number' },
      ],
    },
    {
      title: 'Documents & Permits (optional)',
      fields: [
        { label: 'Permit Number', name: 'permit_number' },
        { label: 'Permit Expiry', name: 'permit_expiry', type: 'date' },
        { label: 'Insurance Number', name: 'insurance_number' },
        { label: 'Insurance Expiry', name: 'insurance_expiry', type: 'date' },
        { label: 'Fitness Certificate Expiry', name: 'fitness_certificate_expiry', type: 'date' },
      ],
    },
  ];

  const batthaSections = () => [
    {
      title: 'Commission (Battha) Configuration',
      description: 'Set commission percentage for each employee type (0-100%)',
      fields: [
        {
          label: 'Driver Battha (%)',
          name: 'driver_battha',
          type: 'number',
          placeholder: '0',
          hint: 'Enter percentage (0-100)',
          min: 0,
          max: 100,
          step: 0.01,
        },
        {
          label: 'Conductor Battha (%)',
          name: 'conductor_battha',
          type: 'number',
          placeholder: '0',
          hint: 'Enter percentage (0-100)',
          min: 0,
          max: 100,
          step: 0.01,
        },
        {
          label: 'Cleaner Battha (%)',
          name: 'cleaner_battha',
          type: 'number',
          placeholder: '0',
          hint: 'Enter percentage (0-100)',
          min: 0,
          max: 100,
          step: 0.01,
        },
      ],
    },
  ];

  // ── TABLE COLUMNS ───────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        header: 'Reg. No.',
        cell: (row) => (
          <span className="font-mono text-sm font-semibold">{row.registration_number?.toUpperCase() || '—'}</span>
        ),
      },
      { header: 'Name', accessor: 'bus_name' },
      { header: 'Route', accessor: 'route', cell: (row) => <span className="text-sm">{row.route || '—'}</span> },
      {
        header: 'Type',
        cell: (row) => (
          <span className="text-xs font-medium text-gray-700">
            {row.bus_type ? row.bus_type.replace('_', ' ') : '—'}
          </span>
        ),
      },
      {
        header: 'Commission',
        cell: (row) => {
          const batthaConfigs = row.battha_configs || [];
          const driverBattha = batthaConfigs.find(c => c.employee_type === 'DRIVER');
          return (
            <div className="text-xs text-gray-600">
              {driverBattha ? `${driverBattha.percentage}%` : '—'}
            </div>
          );
        },
      },
      {
        header: 'Operational',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.is_operational ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {row.is_operational ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {row.is_operational ? 'Yes' : 'No'}
            </span>
            <button
              onClick={() => openToggleConfirm(row)}
              className={`p-1 rounded transition-colors ${
                row.is_operational ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
              }`}
              title={row.is_operational ? 'Mark as Non-Operational' : 'Mark as Operational'}
            >
              {row.is_operational ? <CheckCircle size={16} /> : <XCircle size={16} />}
            </button>
          </div>
        ),
      },
      {
        header: 'Actions',
        cell: (row) => (
          <div className="flex items-center gap-3">
            <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800" title="Edit">
              <Edit size={16} />
            </button>
            <button onClick={() => openDelete(row)} className="text-red-600 hover:text-red-800" title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center   flex-shrink-0">
              <Bus className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Bus Management</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 line-clamp-2">
                Manage your buses and employee commission rates
              </p>
            </div>
          </div>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {apiError}
          </div>
        )}

        <StatsCards
          total={buses.length}
          operational={buses.filter((b) => b.is_operational).length}
          label="Buses"
        />

        <ActionBar
          search={searchQuery}
          onSearch={setSearchQuery}
          onAdd={handleAdd}
          addLabel="Add New Bus"
          searchPlaceholder="Search by reg. no., name, route..."
        />

        <div className="bg-white rounded-xl  overflow-hidden border border-gray-100">
          <GenericTable
            rows={filteredBuses}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No buses found"
          />
        </div>

        {/* ── CREATE/EDIT MODAL ────────────────────────────────────────────── */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForms();
          }}
          title={selectedBus ? 'Edit Bus' : currentStep === 1 ? 'Step 1: Bus Information' : 'Step 2: Commission Rates'}
          icon={currentStep === 1 ? Bus : Percent}
          sections={currentStep === 1 ? basicSections() : batthaSections()}
          register={currentStep === 1 ? registerBasic : registerBattha}
          errors={currentStep === 1 ? basicForm.formState.errors : batthaFormState.errors}
          onSubmit={
            currentStep === 1
              ? handleBasicSubmit(onSubmitBasic)
              : handleBatthaSubmit(onSubmitBattha)
          }
          loading={loading}
          submitLabel={
            selectedBus
              ? 'Update Bus'
              : currentStep === 1
              ? 'Next → Commission'
              : 'Finish & Create Bus'
          }
          extraButtons={
            currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
              >
                ← Back to Bus Info
              </button>
            )
          }
        />

        {/* Delete & Toggle Confirmations */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedBus(null);
          }}
          onConfirm={confirmDelete}
          loading={loading}
          title="Delete Bus?"
          message={`Are you sure you want to delete "${selectedBus?.bus_name || ''}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          icon={Trash2}
        />

        <ConfirmModal
          isOpen={isToggleOpOpen}
          onClose={() => {
            setIsToggleOpOpen(false);
            setToggleTarget(null);
          }}
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
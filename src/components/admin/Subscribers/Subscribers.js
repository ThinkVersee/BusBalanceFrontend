'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/config/axiosInstance';
import {
  Users,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
} from 'lucide-react';

// ---------- COMMON COMPONENTS ----------
import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { BlockConfirmModal } from '@/components/common/BlockConfirmModal';

export default function SubscribersManagement() {
  /* ------------------------------------------------------------------ */
  /*  STATE                                                             */
  /* ------------------------------------------------------------------ */
  const [subs, setSubs] = useState([]);
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [owners, setOwners] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [blockAction, setBlockAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  /* ------------------------------------------------------------------ */
  /*  FETCH DATA                                                       */
  /* ------------------------------------------------------------------ */
  const fetchOwners = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/owners/bus-owners/');
      setOwners(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/superadmin/subscriptions/');
      setSubscriptions(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosInstance.get('/superadmin/subscribers/');
      const normalized = data.map(s => ({
        ...s,
        owner_name: s.owner?.name || s.owner_name || '—',
        subscription_name: s.subscription?.plan_name || s.subscription_name || '—',
      }));
      setSubs(normalized);
      setFilteredSubs(normalized);
    } catch (e) {
      setApiError(e.response?.data?.detail || e.message || 'Failed to load');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwners();
    fetchSubscriptions();
    fetchSubscribers();
  }, [fetchOwners, fetchSubscriptions, fetchSubscribers]);

  /* ------------------------------------------------------------------ */
  /*  SEARCH                                                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const filtered = subs.filter(s =>
      [s.owner_name, s.subscription_name].some(f => f?.toLowerCase().includes(q))
    );
    setFilteredSubs(filtered);
  }, [searchQuery, subs]);

  /* ------------------------------------------------------------------ */
  /*  FORM HELPERS                                                     */
  /* ------------------------------------------------------------------ */
  const resetForm = () => {
    reset({ owner_id: '', subscription_id: '' });
    setSelected(null);
  };

  const openAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = sub => {
    setSelected(sub);
    setValue('owner_id', sub.owner?.id ?? sub.owner_id);
    setValue('subscription_id', sub.subscription?.id ?? sub.subscription_id);
    setIsModalOpen(true);
  };

  /* ------------------------------------------------------------------ */
  /*  SUBMIT                                                           */
  /* ------------------------------------------------------------------ */
  const onSubmit = async data => {
    setLoading(true);
    try {
      const payload = {
        owner_id: Number(data.owner_id),
        subscription_id: Number(data.subscription_id),
      };
      if (selected) {
        await axiosInstance.put(`/superadmin/subscribers/${selected.id}/`, payload);
      } else {
        await axiosInstance.post('/superadmin/subscribers/', payload);
      }
      await fetchSubscribers();
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

  /* ------------------------------------------------------------------ */
  /*  DELETE                                                           */
  /* ------------------------------------------------------------------ */
  const openDelete = sub => {
    setSelected(sub);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await axiosInstance.delete(`/superadmin/subscribers/${selected.id}/`);
      setSubs(prev => prev.filter(s => s.id !== selected.id));
      setFilteredSubs(prev => prev.filter(s => s.id !== selected.id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    } finally {
      setIsDeleteOpen(false);
      setSelected(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  BLOCK / UNBLOCK                                                  */
  /* ------------------------------------------------------------------ */
  const openBlock = sub => {
    setSelected(sub);
    setBlockAction(sub.is_active ? 'block' : 'unblock');
    setIsBlockOpen(true);
  };

  const confirmBlock = async () => {
    if (!selected) return;
    try {
      const { data } = await axiosInstance.patch(
        `/superadmin/subscribers/${selected.id}/toggle-status/`
      );
      const updated = { ...selected, is_active: data.is_active };
      setSubs(prev => prev.map(s => (s.id === selected.id ? updated : s)));
      setFilteredSubs(prev => prev.map(s => (s.id === selected.id ? updated : s)));
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setIsBlockOpen(false);
      setSelected(null);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  FORM SECTIONS                                                    */
  /* ------------------------------------------------------------------ */
  const subscriberSections = [
    {
      title: 'Subscriber Details',
      fields: [
        {
          label: 'Owner',
          name: 'owner_id',
          type: 'select',
          required: true,
          options: owners.map(o => ({ value: o.id, label: o.name })),
        },
        {
          label: 'Subscription',
          name: 'subscription_id',
          type: 'select',
          required: true,
          options: subscriptions.map(s => ({
            value: s.id,
            label: `${s.plan_name} (${s.billing_cycle} months)`,
          })),
        },
      ],
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  TABLE COLUMNS                                                    */
  /* ------------------------------------------------------------------ */
  const columns = useMemo(
    () => [
      { header: 'Owner', accessor: 'owner_name' },
      { header: 'Subscription', accessor: 'subscription_name' },
      { header: 'Start Date', accessor: 'start_date' },
      { header: 'End Date', accessor: 'end_date' },
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
        header: 'Actions',
        cell: row => (
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
              onClick={() => openBlock(row)}
              className={`${
                row.is_active
                  ? 'text-orange-600 hover:text-orange-800'
                  : 'text-green-600 hover:text-green-800'
              } transition-colors`}
              title={row.is_active ? 'Block subscriber' : 'Unblock subscriber'}
            >
              <Ban size={16} />
            </button>
          </div>
        ),
      },
    ],
    [openEdit, openDelete, openBlock]
  );

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscribers</h1>
              <p className="text-gray-600 text-sm">Manage which owners are subscribed to which plans</p>
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
          total={subs.length}
          active={subs.filter(s => s.is_active).length}
          label="Subscribers"
        />

        {/* ACTION BAR */}
        <ActionBar
          search={searchQuery}
          onSearch={setSearchQuery}
          onAdd={openAdd}
          addLabel="Add Subscriber"
          searchPlaceholder="Search by owner or plan..."
        />

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <GenericTable
            rows={filteredSubs}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No subscribers found"
          />
        </div>

        {/* FORM MODAL */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selected ? 'Edit Subscriber' : 'Add Subscriber'}
          icon={Users}
          sections={subscriberSections}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={selected ? 'Update' : 'Create'}
        />

        {/* DELETE MODAL */}
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          entity={selected}
          entityName={selected?.owner_name}
          onConfirm={confirmDelete}
          loading={loading}
        />

        {/* BLOCK MODAL */}
        <BlockConfirmModal
          isOpen={isBlockOpen}
          onClose={() => setIsBlockOpen(false)}
          entity={selected}
          entityName={selected?.owner_name}
          action={blockAction}
          onConfirm={confirmBlock}
          loading={false}
        />
      </div>
    </div>
  );
}
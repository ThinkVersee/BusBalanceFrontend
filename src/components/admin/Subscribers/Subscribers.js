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
  RefreshCw,
} from 'lucide-react';

import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import {ConfirmModal } from '@/components/common/ConfirmModal';


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
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'renew'
  const [blockAction, setBlockAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  /* ------------------------------------------------------------------ */
  /*  UTILS                                                            */
  /* ------------------------------------------------------------------ */
  const formatDate = (iso) => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}-${m}-${y}`;
  };

  /* ------------------------------------------------------------------ */
  /*  FETCH DATA                                                       */
  /* ------------------------------------------------------------------ */
  const fetchOwners = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/owners/bus-owners/');
      setOwners(data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/superadmin/subscriptions/');
      setSubscriptions(data);
    } catch (e) { console.error(e); }
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

  const filteredAndSorted = subs
    .filter(s =>
      [s.owner_name, s.subscription_name].some(f => f?.toLowerCase().includes(q))
    )
    .sort((a, b) => b.id - a.id); // NEW: Keep newest/updated on top

  setFilteredSubs(filteredAndSorted);
}, [searchQuery, subs]);

  /* ------------------------------------------------------------------ */
  /*  EXPIRY LOGIC                                                     */
  /* ------------------------------------------------------------------ */
  const today = new Date().toISOString().slice(0, 10);

  const isExpired = useCallback((row) => {
    const end = row.end_date;
    return end && end < today;
  }, [today]);

  /* ------------------------------------------------------------------ */
  /*  OWNER DROPDOWN LOGIC                                             */
  /* ------------------------------------------------------------------ */
  const ownersWithSubscription = useMemo(() => {
    const ids = new Set(subs.map(s => s.owner?.id ?? s.owner_id));
    return ids;
  }, [subs]);

  const expiredOwnerIds = useMemo(() => {
    const set = new Set();
    subs.forEach(s => {
      if (s.end_date && s.end_date < today) {
        const id = s.owner?.id ?? s.owner_id;
        if (id) set.add(id);
      }
    });
    return set;
  }, [subs, today]);

  // For "Add" → exclude all owners who already have a subscription
  const addOwnerOptions = useMemo(() => {
    return owners
      .filter(o => !ownersWithSubscription.has(o.id))
      .map(o => ({ value: o.id, label: o.name }));
  }, [owners, ownersWithSubscription]);

  // For "Edit / Renew" → include current owner + free + expired
  const editOwnerOptions = useMemo(() => {
    return owners
      .filter(o => {
        const hasSub = ownersWithSubscription.has(o.id);
        const isExp = expiredOwnerIds.has(o.id);
        const isCurrent = o.id === selected?.owner?.id || o.id === selected?.owner_id;
        return isCurrent || !hasSub || isExp;
      })
      .map(o => ({ value: o.id, label: o.name }));
  }, [owners, ownersWithSubscription, expiredOwnerIds, selected]);

  /* ------------------------------------------------------------------ */
  /*  MODAL HELPERS                                                    */
  /* ------------------------------------------------------------------ */
  const resetForm = () => {
    reset({ owner_id: '', subscription_id: '' });
    setSelected(null);
    setModalMode('add');
  };

  const openAdd = () => {
    resetForm();
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEdit = (sub) => {
    setSelected(sub);
    setValue('owner_id', sub.owner?.id ?? sub.owner_id);
    setValue('subscription_id', sub.subscription?.id ?? sub.subscription_id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openRenew = (expiredSub) => {
    setSelected(expiredSub);
    setValue('owner_id', expiredSub.owner?.id ?? expiredSub.owner_id);
    setValue('subscription_id', ''); // force pick new plan
    setModalMode('renew');
    setIsModalOpen(true);
  };

  /* ------------------------------------------------------------------ */
  /*  SUBMIT – Add / Edit / Renew                                      */
  /* ------------------------------------------------------------------ */
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        owner_id: Number(data.owner_id),
        subscription_id: Number(data.subscription_id),
      };

      // For Renew: calculate new start/end dates
      if (modalMode === 'renew') {
        const sub = subscriptions.find(s => s.id === Number(data.subscription_id));
        const months = sub?.billing_cycle || 1;
        const start = new Date().toISOString().slice(0, 10);
        const end = new Date();
        end.setMonth(end.getMonth() + months);
        const endStr = end.toISOString().slice(0, 10);

        payload.start_date = start;
        payload.end_date = endStr;
      }

      if (modalMode === 'add') {
        await axiosInstance.post('/superadmin/subscribers/', payload);
      } else {
        // edit OR renew → PUT
        await axiosInstance.put(`/superadmin/subscribers/${selected.id}/`, payload);
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
  const openDelete = (sub) => {
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
  const openBlock = (sub) => {
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
      title: modalMode === 'renew' ? 'Renew Subscription' : 'Subscriber Details',
      fields: [
        {
          label: 'Owner',
          name: 'owner_id',
          type: 'select',
          required: true,
          disabled: modalMode === 'renew',
          options: modalMode === 'add' ? addOwnerOptions : editOwnerOptions,
        },
        {
          label: modalMode === 'renew' ? 'New Subscription' : 'Subscription',
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
      { header: 'Start Date', accessor: row => formatDate(row.start_date) },
      {
        header: 'End Date',
        accessor: row => {
          const exp = isExpired(row);
          return (
            <span className={exp ? 'text-red-600 font-medium' : ''}>
              {formatDate(row.end_date)} {exp && <span className="text-xs">(Expired)</span>}
            </span>
          );
        },
      },
      {
        header: 'Status',
        cell: row => {
          const exp = isExpired(row);
          if (exp) {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Ban size={14} />
                Expired
              </span>
            );
          }
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {row.is_active ? <CheckCircle size={14} /> : <Ban size={14} />}
              {row.is_active ? 'Active' : 'Blocked'}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        cell: row => (
          <div className="flex items-center gap-3">
            <button onClick={() => openEdit(row)} className="text-blue-600 hover:text-blue-800" title="Edit">
              <Edit size={16} />
            </button>
            <button onClick={() => openDelete(row)} className="text-red-600 hover:text-red-800" title="Delete">
              <Trash2 size={16} />
            </button>
            {!isExpired(row) && (
              <button
                onClick={() => openBlock(row)}
                className={`${row.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'} transition-colors`}
                title={row.is_active ? 'Block' : 'Unblock'}
              >
                <Ban size={16} />
              </button>
            )}
          </div>
        ),
      },
    ],
    [openEdit, openDelete, openBlock, isExpired]
  );

  /* ------------------------------------------------------------------ */
  /*  RENEW SECTION (expired owners)                                   */
  /* ------------------------------------------------------------------ */
  const expiredOwners = useMemo(() => {
    const map = new Map();
    subs.filter(isExpired).forEach(s => {
      const id = s.owner?.id ?? s.owner_id;
      const name = s.owner_name;
      if (id && name) map.set(id, { id, name, sub: s });
    });
    return Array.from(map.values());
  }, [subs, isExpired]);

  const renewColumns = useMemo(
    () => [
      { header: 'Owner', accessor: 'name' },
      { header: 'Current Plan', accessor: row => row.sub?.subscription_name || '—' },
      { header: 'Expired On', accessor: row => formatDate(row.sub?.end_date) },
      {
        header: 'Actions',
        cell: row => (
          <button
            onClick={() => openRenew(row.sub)}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Renew"
          >
            <RefreshCw size={16} />
          </button>
        ),
      },
    ],
    [openRenew]
  );

  const expiredCount = useMemo(() => subs.filter(isExpired).length, [subs, isExpired]);

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
  <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 sm:min-w-0">
    {/* Icon – scales & stays square */}
    <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 
                    bg-gradient-to-br from-blue-600 to-blue-700 
                    rounded-lg sm:rounded-xl 
                    flex items-center justify-center  ">
      <Users className="text-white w-5 h-5 sm:w-5.5 lg:w-6" />
    </div>

    {/* Text – safe truncation & responsive font */}
    <div className="flex-1 min-w-0">
      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 
                     font-bold text-gray-900 
                     truncate">
        Subscribers
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 mt-0.5 
                    line-clamp-2">
        Manage which owners are subscribed to which plans
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
          total={subs.length}
          active={subs.filter(s => s.is_active && !isExpired(s)).length}
          expired={expiredCount}
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

        {/* ACTIVE SUBSCRIBERS TABLE */}
        <div className="bg-white rounded-xl   overflow-hidden border border-gray-300 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Subscribers</h2>
          </div>
          <GenericTable
            rows={filteredSubs.filter(s => !isExpired(s))}
            columns={columns}
            loading={apiLoading}
            emptyMessage="No active subscribers found"
          />
        </div>

        {/* EXPIRED SUBSCRIBERS (RENEW SECTION) */}
        {expiredCount > 0 && (
          <div className="bg-white rounded-xl  overflow-hidden border border-gray-300">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
              <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                <Ban size={20} />
                Expired Subscriptions ({expiredCount})
              </h2>
              <p className="text-sm text-red-600 mt-1">Renew these subscriptions to restore access</p>
            </div>
            <GenericTable
              rows={expiredOwners}
              columns={renewColumns}
              loading={apiLoading}
              emptyMessage="No expired subscriptions"
            />
          </div>
        )}

        {/* SINGLE MODAL – Add / Edit / Renew */}
        <FormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); resetForm(); }}
          title={
            modalMode === 'add' ? 'Add Subscriber' :
            modalMode === 'edit' ? 'Edit Subscriber' :
            'Renew Subscription'
          }
          icon={modalMode === 'renew' ? RefreshCw : Users}
          sections={subscriberSections}
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={loading}
          submitLabel={modalMode === 'add' ? 'Create' : 'Save'}
        />

        {/* DELETE MODAL */}
                {/* DELETE MODAL */}
        <ConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelected(null);
          }}
          onConfirm={confirmDelete}
          loading={loading}
          title="Delete Subscriber?"
          message="Are you sure you want to delete {name}'s subscription? This cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          icon={Trash2}
          entity={selected}
          entityName={selected?.owner_name}
        />

        {/* BLOCK / UNBLOCK MODAL */}
        <ConfirmModal
          isOpen={isBlockOpen}
          onClose={() => {
            setIsBlockOpen(false);
            setSelected(null);
          }}
          onConfirm={confirmBlock}
          loading={false}
          title={blockAction === 'block' ? 'Block Subscriber?' : 'Unblock Subscriber?'}
          message={
            blockAction === 'block'
              ? 'Are you sure you want to block {name}? They will lose access.'
              : 'Are you sure you want to unblock {name}? They will regain access.'
          }
          confirmText={blockAction === 'block' ? 'Block' : 'Unblock'}
          cancelText="Cancel"
          confirmVariant={blockAction === 'block' ? 'warning' : 'success'}
          icon={Ban}
          entity={selected}
          entityName={selected?.owner_name}
        />
      </div>
    </div>
  );
}
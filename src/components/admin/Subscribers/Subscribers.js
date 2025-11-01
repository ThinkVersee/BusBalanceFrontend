'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axiosInstance from '@/config/axiosInstance';
import {
  Users,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { createElement as h } from 'react';

// ---------- COMMON COMPONENTS ----------
import { StatsCards } from '@/components/common/StatsCards';
import { ActionBar } from '@/components/common/ActionBar';
import { GenericTable } from '@/components/common/GenericTable';
import { FormModal } from '@/components/common/FormModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { BlockConfirmModal } from '@/components/common/BlockConfirmModal';

// ---------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------
const subscriberSchema = z.object({
  owner_id: z.coerce.number().int('Select owner'),
  subscription_id: z.coerce.number().int('Select subscription plan'),
});

// ---------------------------------------------------------------------
// FORM SECTIONS
// ---------------------------------------------------------------------
const subscriberSections = [
  {
    title: 'Subscriber Details',
    fields: [
      { label: 'Owner ID', name: 'owner_id', type: 'number', required: true },
      {
        label: 'Subscription ID',
        name: 'subscription_id',
        type: 'number',
        required: true,
      },
    ],
  },
];

export default function SubscriberManagement() {
  const [subs, setSubs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [selected, setSelected] = useState(null);
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
  } = useForm({ resolver: zodResolver(subscriberSchema) });

  // -----------------------------------------------------------------
  // FETCH SUBSCRIBERS
  // -----------------------------------------------------------------
  const fetchSubs = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const { data } = await axiosInstance.get('/superadmin/subscribers/');
      setSubs(data);
      setFiltered(data);
    } catch (e) {
      setApiError(e.response?.data?.detail || e.message || 'Failed to load subscribers');
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  // -----------------------------------------------------------------
  // SEARCH
  // -----------------------------------------------------------------
  useEffect(() => {
    const q = search.toLowerCase();
    const res = subs.filter((s) =>
      [s.owner_name, s.subscription_name]
        .some((f) => String(f || '').toLowerCase().includes(q))
    );
    setFiltered(res);
  }, [search, subs]);

  // -----------------------------------------------------------------
  // FORM HELPERS
  // -----------------------------------------------------------------
  const resetForm = () => {
    reset({
      owner_id: '',
      subscription_id: '',
    });
    setSelected(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (sub) => {
    setSelected(sub);
    setValue('owner_id', sub.owner?.id || '');
    setValue('subscription_id', sub.subscription?.id || '');
    setModalOpen(true);
  };

  // -----------------------------------------------------------------
  // SUBMIT
  // -----------------------------------------------------------------
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (selected) {
        await axiosInstance.put(`/superadmin/subscribers/${selected.id}/`, data);
      } else {
        await axiosInstance.post('/superadmin/subscribers/', data);
      }
      await fetchSubs();
      setModalOpen(false);
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
  const openDelete = (sub) => {
    setSelected(sub);
    setDelOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await axiosInstance.delete(`/superadmin/subscribers/${selected.id}/`);
      setSubs((prev) => prev.filter((s) => s.id !== selected.id));
      setFiltered((prev) => prev.filter((s) => s.id !== selected.id));
    } catch (e) {
      alert(e.response?.data?.detail || 'Delete failed');
    } finally {
      setDelOpen(false);
      setSelected(null);
    }
  };

  // -----------------------------------------------------------------
  // BLOCK / UNBLOCK
  // -----------------------------------------------------------------
  const openBlock = (sub) => {
    setSelected(sub);
    setBlockAction(sub.is_active ? 'block' : 'unblock');
    setBlockOpen(true);
  };

  const confirmBlock = async () => {
    if (!selected) return;
    try {
      const { data } = await axiosInstance.patch(`/superadmin/subscribers/${selected.id}/toggle-status/`);
      setSubs((prev) =>
        prev.map((s) =>
          s.id === selected.id ? { ...s, is_active: data.is_active } : s
        )
      );
      setFiltered((prev) =>
        prev.map((s) =>
          s.id === selected.id ? { ...s, is_active: data.is_active } : s
        )
      );
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setBlockOpen(false);
      setSelected(null);
    }
  };

  // -----------------------------------------------------------------
  // TABLE COLUMNS
  // -----------------------------------------------------------------
  const columns = useMemo(
    () => [
      { header: 'Owner', accessor: 'owner_name' },
      { header: 'Subscription', accessor: 'subscription_name' },
      { header: 'Start Date', accessor: 'start_date' },
      { header: 'End Date', accessor: 'end_date' },
      {
        header: 'Status',
        cell: (row) =>
          h(
            'span',
            {
              className: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`,
            },
            row.is_active ? h(CheckCircle, { size: 14 }) : h(XCircle, { size: 14 }),
            row.is_active ? 'Active' : 'Blocked'
          ),
      },
      {
        header: 'Actions',
        cell: (row) =>
          h(
            'div',
            { className: 'flex items-center gap-3' },
            // Edit
            h(
              'button',
              {
                onClick: () => openEdit(row),
                className: 'text-blue-600 hover:text-blue-800 transition-colors',
                title: 'Edit',
              },
              h(Edit, { size: 16 })
            ),
            // Delete
            h(
              'button',
              {
                onClick: () => openDelete(row),
                className: 'text-red-600 hover:text-red-800 transition-colors',
                title: 'Delete',
              },
              h(Trash2, { size: 16 })
            ),
            // Block
            h(
              'button',
              {
                onClick: () => openBlock(row),
                className: `${
                  row.is_active
                    ? 'text-orange-600 hover:text-orange-800'
                    : 'text-green-600 hover:text-green-800'
                } transition-colors`,
                title: row.is_active ? 'Block' : 'Unblock',
              },
              h(Ban, { size: 16 })
            )
          ),
      },
    ],
    []
  );

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------
  return h(
    'div',
    {
      className:
        'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 sm:p-6 lg:p-8',
    },
    h(
      'div',
      { className: 'max-w-7xl mx-auto' },

      // HEADER
      h(
        'div',
        { className: 'flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8' },
        h(
          'div',
          { className: 'flex items-center gap-3' },
          h('div', {
            className:
              'w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg',
            children: h(Users, { className: 'text-white', size: 24 }),
          }),
          h(
            'div',
            null,
            h('h1', { className: 'text-2xl sm:text-3xl font-bold text-gray-900' }, 'Subscribers Management'),
            h('p', { className: 'text-gray-600 text-sm' }, 'Manage bus owner subscriptions and status')
          )
        )
      ),

      apiError &&
        h('div', { className: 'bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm' }, apiError),

      h(StatsCards, {
        total: subs.length,
        active: subs.filter((s) => s.is_active).length,
        verified: 0,
        label: 'Subscribers',
      }),

      h(ActionBar, {
        search,
        onSearch: setSearch,
        onAdd: openAdd,
        addLabel: 'Add Subscriber',
        searchPlaceholder: 'Search by owner or plan',
      }),

      h('div', { className: 'bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100' },
        h(GenericTable, {
          rows: filtered,
          columns,
          loading: apiLoading,
          emptyMessage: 'No subscribers found',
        })
      ),

      h(FormModal, {
        isOpen: modalOpen,
        onClose: () => setModalOpen(false),
        title: selected ? 'Edit Subscriber' : 'Add New Subscriber',
        icon: Users,
        sections: subscriberSections,
        register,
        errors,
        onSubmit: handleSubmit(onSubmit),
        loading,
        submitLabel: selected ? 'Update Subscriber' : 'Create Subscriber',
      }),

      h(DeleteConfirmModal, {
        isOpen: delOpen,
        onClose: () => setDelOpen(false),
        entity: selected,
        onConfirm: confirmDelete,
        loading,
      }),

      h(BlockConfirmModal, {
        isOpen: blockOpen,
        onClose: () => setBlockOpen(false),
        entity: selected,
        action: blockAction,
        onConfirm: confirmBlock,
        loading: false,
      })
    )
  );
}

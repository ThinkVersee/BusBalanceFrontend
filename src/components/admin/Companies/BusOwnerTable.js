// src/components/admin/Companies/BusOwnerTable.js
import { Edit2, Trash2, Ban, CheckCircle, Building2, Loader2 } from 'lucide-react';

export const BusOwnerTable = ({
  owners,
  loading,
  onEdit,
  onDelete,
  onBlock,
  onVerify,
}) => {
  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <tr>
            {['Owner', 'Company', 'License', 'Contact', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {owners.map((owner) => (
            <tr key={owner.id} className="hover:bg-blue-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Building2 className="text-white" size={22} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-gray-900">{owner.name}</div>
                    <div className="text-sm text-gray-500">{owner.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{owner.company_name}</td>
              <td className="px-6 py-4">
                <div className="text-sm font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                  {owner.license_number}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{owner.business_phone || '—'}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${owner.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {owner.is_active ? 'Active' : 'Blocked'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${owner.is_verified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {owner.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(owner)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDelete(owner)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Delete">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => onBlock(owner)} className={`p-2 hover:bg-gray-100 rounded-lg ${owner.is_active ? 'text-orange-600' : 'text-green-600'}`} title={owner.is_active ? 'Block' : 'Unblock'}>
                    <Ban size={18} />
                  </button>
                  {!owner.is_verified && (
                    <button onClick={() => onVerify(owner)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg" title="Verify">
                      <CheckCircle size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
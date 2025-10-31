import { X, Building2, Mail } from 'lucide-react';

export const BusOwnerFormModal = ({
  isOpen,
  onClose,
  selectedOwner,
  register,
  errors,
  onSubmit,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedOwner ? 'Edit Bus Owner' : 'Add New Bus Owner'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* ---------- USER INFO ---------- */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                User Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Password hint – only on create */}
                {!selectedOwner && (
                  <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Mail className="text-blue-600 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Password will be auto-generated</p>
                      <p className="text-xs text-blue-700 mt-1">
                        A secure random password will be created and emailed to the owner immediately after saving.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ---------- BUSINESS INFO ---------- */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Business Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    {...register('company_name')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.company_name && <p className="text-red-600 text-xs mt-1">{errors.company_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                  <input
                    {...register('license_number')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.license_number && <p className="text-red-600 text-xs mt-1">{errors.license_number.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
                  <textarea
                    {...register('business_address')}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.business_address && <p className="text-red-600 text-xs mt-1">{errors.business_address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                  <input
                    type="tel"
                    {...register('business_phone')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.business_phone && <p className="text-red-600 text-xs mt-1">{errors.business_phone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    {...register('pan_number')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input
                    {...register('gst_number')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ---------- BUTTONS ---------- */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium shadow-lg shadow-blue-600/30"
              >
                {loading ? 'Saving...' : selectedOwner ? 'Update' : 'Create & Email Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
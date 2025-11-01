import { X, Loader2 } from 'lucide-react';

export const FormModal = ({
  isOpen,
  onClose,
  title = 'Form',
  icon: Icon = null,
  sections = [],
  register,
  errors,
  onSubmit,
  loading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  extraInfo = null,
}) => {
  if (!isOpen) return null;

  const baseInputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 sm:p-8">

          {/* HEADER */}
          <div className="flex justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Icon className="text-white" size={20} />
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-6">

            {/* DYNAMIC SECTIONS */}
            {sections.map((section, secIdx) => (
              <div key={secIdx} className="bg-gray-50 rounded-xl p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  {section.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map((field, fieldIdx) => {
                    const error = errors[field.name] && (
                      <p className="text-red-600 text-xs mt-1">{errors[field.name].message}</p>
                    );

                    let inputElement;

                    if (field.type === 'textarea') {
                      inputElement = (
                        <textarea
                          {...register(field.name)}
                          placeholder={field.placeholder}
                          rows={field.rows || 3}
                          className={baseInputClass}
                          disabled={field.disabled}
                        />
                      );
                    } else if (field.type === 'select') {
                      inputElement = (
                        <select
                          {...register(field.name)}
                          disabled={field.disabled || !field.options?.length}
                          className={baseInputClass}
                        >
                          <option value="">{field.placeholder || 'Select...'}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      );
                    } else {
                      inputElement = (
                        <input
                          {...register(field.name)}
                          type={field.type || 'text'}
                          placeholder={field.placeholder}
                          className={baseInputClass}
                          disabled={field.disabled}
                        />
                      );
                    }

                    return (
                      <div
                        key={fieldIdx}
                        className={field.colSpan || 'col-span-1 sm:col-span-2'}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-600 ml-1">*</span>}
                        </label>
                        {inputElement}
                        {error}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* EXTRA INFO */}
            {extraInfo && (
              <div className="col-span-1 sm:col-span-2 text-sm text-gray-600">
                {extraInfo}
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto order-2 sm:order-1 px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto order-1 sm:order-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Saving...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
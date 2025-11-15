'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';

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
  watch,
  setValue,
}) => {
  const [openDropdown, setOpenDropdown] = useState({});
  const dropdownRefs = useRef({}); // To track dropdown DOM nodes

  useEffect(() => {
    if (isOpen) {
      setOpenDropdown({});
    }
  }, [isOpen]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((name) => {
        if (
          dropdownRefs.current[name] &&
          !dropdownRefs.current[name].contains(event.target)
        ) {
          setOpenDropdown((prev) => ({ ...prev, [name]: false }));
        }
      });
    };

    if (Object.values(openDropdown).some((v) => v)) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  if (!isOpen) return null;

  const baseInputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 !text-gray-900';

  const baseSelectClass =
    'w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 !text-gray-900 bg-white appearance-none';

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => {
      const newState = { ...prev };
      // Close all others
      Object.keys(newState).forEach((key) => {
        if (key !== name) newState[key] = false;
      });
      newState[name] = !prev[name];
      return newState;
    });
  };

  const closeDropdown = (name) => {
    setOpenDropdown((prev) => ({ ...prev, [name]: false }));
  };

  const handleCheckboxChange = (name, value, checked, selected) => {
    let newSelected;
    if (checked) {
      newSelected = [...selected, value];
    } else {
      newSelected = selected.filter((v) => v !== value);
    }
    setValue(name, newSelected);
    // Close dropdown after selection
    closeDropdown(name);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          Object.keys(openDropdown).forEach((name) => closeDropdown(name));
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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
              onClick={() => {
                Object.keys(openDropdown).forEach((name) => closeDropdown(name));
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-6">
            {sections.map((section, secIdx) => {
              if (section.hidden) return null;
              return (
                <div key={secIdx} className="bg-gray-50 rounded-xl p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.fields.map((field) => {
                      if (field.hidden) return null;
                      const error = errors[field.name] && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors[field.name].message}
                        </p>
                      );
                      let inputElement;

                      // TEXT / EMAIL / TEL / DATE / NUMBER
                      if (!field.type || ['text', 'email', 'tel', 'date', 'number'].includes(field.type)) {
                        inputElement = (
                          <input
                            {...register(field.name)}
                            type={field.type || 'text'}
                            placeholder={field.placeholder}
                            className={baseInputClass}
                            disabled={field.disabled}
                            step={field.step}
                          />
                        );
                      }
                      // TEXTAREA
                      else if (field.type === 'textarea') {
                        inputElement = (
                          <textarea
                            {...register(field.name)}
                            placeholder={field.placeholder}
                            rows={field.rows || 3}
                            className={baseInputClass}
                            disabled={field.disabled}
                          />
                        );
                      }
                      // SELECT (Native)
                      else if (field.type === 'select') {
                        inputElement = (
                          <select
                            {...register(field.name)}
                            disabled={field.disabled || !field.options?.length}
                            className={baseSelectClass}
                          >
                            <option value="">{field.placeholder || 'Select...'}</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value} className="text-gray-900">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        );
                      }
                      // MULTISELECT (Custom)
                      else if (field.type === 'multiselect') {
                        const selected = watch(field.name) || [];
                        const isOpen = !!openDropdown[field.name];

                        inputElement = (
                          <div
                            className="relative"
                            ref={(el) => (dropdownRefs.current[field.name] = el)}
                          >
                            {/* Selected Tags */}
                            <div
                              className={`${baseInputClass} min-h-[42px] flex flex-wrap items-center gap-2 py-2 pr-10 cursor-pointer select-none`}
                              onClick={() => toggleDropdown(field.name)}
                            >
                              {selected.length === 0 ? (
                                <span className="text-gray-500">
                                  {field.placeholder || 'Select...'}
                                </span>
                              ) : (
                                selected.map((val) => {
                                  const opt = field.options?.find((o) => o.value === val);
                                  return opt ? (
                                    <span
                                      key={val}
                                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                    >
                                      {opt.label}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setValue(field.name, selected.filter((v) => v !== val));
                                        }}
                                        className="ml-1 hover:text-blue-900"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ) : null;
                                })
                              )}
                              <ChevronDown
                                size={16}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </div>

                            {/* Dropdown */}
                            {isOpen && (
                              <div
                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {field.options?.length > 0 ? (
                                  field.options.map((opt) => {
                                    const checked = selected.includes(opt.value);
                                    return (
                                      <label
                                        key={opt.value}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-900 !text-gray-900"
                                        onClick={() =>
                                          handleCheckboxChange(
                                            field.name,
                                            opt.value,
                                            !checked,
                                            selected
                                          )
                                        }
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          readOnly
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                        />
                                        <span className="text-sm !text-gray-900">{opt.label}</span>
                                      </label>
                                    );
                                  })
                                ) : (
                                  <div className="p-3 text-sm text-gray-500 !text-gray-900">
                                    {field.disabled ? 'Loading buses...' : 'No buses available'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={field.name}
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
              );
            })}

            {extraInfo && (
              <div className="col-span-1 sm:col-span-2 text-sm text-gray-600">{extraInfo}</div>
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
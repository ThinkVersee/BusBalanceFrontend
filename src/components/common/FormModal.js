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
  customRenderers = {},
  extraButtons,
}) => {
  const [openDropdown, setOpenDropdown] = useState({});
  const dropdownRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setOpenDropdown({});
    }
  }, [isOpen]);

  useEffect(() => {
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
    'w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 !text-gray-900 text-sm sm:text-black';

  const baseSelectClass =
    'w-full px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 !text-gray-900 bg-white appearance-none text-sm sm:text-black';

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => {
      const newState = { ...prev };
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
    closeDropdown(name);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          Object.keys(openDropdown).forEach((name) => closeDropdown(name));
          onClose();
        }
      }}
    >
      <div
        className="bg-gray-50 rounded-xl sm:rounded-2xl w-full max-w-[95%] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto  "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-5 md:p-8">
          {/* HEADER */}
          <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {Icon && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Icon className="text-white" size={16} />
                </div>
              )}
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={() => {
                Object.keys(openDropdown).forEach((name) => closeDropdown(name));
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 sm:p-2 rounded-lg transition-all"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* FORM CONTENT */}
          <div onSubmit={onSubmit} className="space-y-3 sm:space-y-6">
            {sections.map((section, secIdx) => {
              if (section.hidden) return null;
              return (
                <div key={secIdx} className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                  <h3 className="text-black sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full" />
                    {section.title}
                  </h3>

                  {section.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{section.description}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {section.fields.map((field) => {
                      if (field.hidden) return null;

                      const error = errors[field.name] && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors[field.name].message}
                        </p>
                      );

                      let inputElement;

                      // CUSTOM RENDERER
                      if (customRenderers?.[field.name]) {
                        inputElement = customRenderers[field.name]();
                      }
                      // TEXT / EMAIL / TEL / DATE / NUMBER
                      else if (!field.type || ['text', 'email', 'tel', 'date', 'number'].includes(field.type)) {
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
                      // SELECT (native)
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
                      // MULTISELECT (custom dropdown)
                      else if (field.type === 'multiselect') {
                        const selected = watch(field.name) || [];
                        const isOpen = !!openDropdown[field.name];

                        inputElement = (
                          <div className="relative" ref={(el) => (dropdownRefs.current[field.name] = el)}>
                            {/* Selected Tags */}
                            <div
                              className={`${baseInputClass} min-h-[36px] sm:min-h-[42px] flex flex-wrap items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 pr-8 sm:pr-10 cursor-pointer select-none`}
                              onClick={() => toggleDropdown(field.name)}
                            >
                              {selected.length === 0 ? (
                                <span className="text-gray-500 text-xs sm:text-sm">{field.placeholder || 'Select...'}</span>
                              ) : (
                                selected.map((val) => {
                                  const opt = field.options?.find((o) => o.value === val);
                                  return opt ? (
                                    <span
                                      key={val}
                                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
                                    >
                                      {opt.label}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setValue(
                                            field.name,
                                            selected.filter((v) => v !== val)
                                          );
                                        }}
                                        className="ml-0.5 hover:text-blue-900"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ) : null;
                                })
                              )}
                              <ChevronDown
                                size={14}
                                className={`sm:w-4 sm:h-4 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 transition-transform ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </div>

                            {/* Dropdown */}
                            {isOpen && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg sm:rounded-xl   z-30 max-h-48 sm:max-h-60 overflow-y-auto">
                                {field.options?.length > 0 ? (
                                  field.options.map((opt) => {
                                    const checked = selected.includes(opt.value);
                                    return (
                                      <label
                                        key={opt.value}
                                        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 cursor-pointer text-gray-900 !text-gray-900"
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
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none w-3.5 h-3.5 sm:w-4 sm:h-4"
                                        />
                                        <span className="text-xs sm:text-sm !text-gray-900">{opt.label}</span>
                                      </label>
                                    );
                                  })
                                ) : (
                                  <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-gray-500 !text-gray-900">
                                    {field.disabled ? 'Loading...' : 'No options available'}
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
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
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
              <div className="col-span-1 sm:col-span-2 text-xs sm:text-sm text-gray-600">{extraInfo}</div>
            )}

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              {extraButtons}

              <button
                type="button"
                onClick={() => {
                  Object.keys(openDropdown).forEach((name) => closeDropdown(name));
                  onClose();
                }}
                className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 bg-gray-200 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm sm:text-black"
              >
                {cancelLabel}
              </button>

              <button
                type="submit"
                disabled={loading}
                onClick={onSubmit}
                className="w-full sm:w-auto order-1 sm:order-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 font-medium   flex items-center justify-center gap-2 text-sm sm:text-white"
              >
                {loading && <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />}
                {loading ? 'Saving...' : submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
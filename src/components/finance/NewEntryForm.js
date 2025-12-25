"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Save,
  Loader2,
  Upload,
  X,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  Trash2,
  Wrench,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Users,
  Wallet,
  Calculator,
  Settings,
  RefreshCw,
  User,
} from "lucide-react";
import axiosInstance from "@/config/axiosInstance";

const NumberInput = ({ value, onChange, disabled = false }) => {
  const inputRef = useRef(null);
  const handleWheel = () => inputRef.current?.blur();
  return (
    <input
      ref={inputRef}
      type="number"
      step="0.01"
      min="0"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onWheel={handleWheel}
      placeholder="0.00"
      disabled={disabled}
      className={`w-24 sm:w-32 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-current text-gray-900 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
      }`}
    />
  );
};

const FileInputSection = ({ files, setFiles }) => {
  const MAX_SIZE = 5 * 1024 * 1024;
 
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    const validFiles = [];
    newFiles.forEach((file) => {
      if (file.size > MAX_SIZE) {
        alert(`${file.name} is larger than 5MB and was not added.`);
      } else {
        validFiles.push(file);
      }
    });
    setFiles((prev) => [...prev, ...validFiles]);
  };
 
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
 
  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <Upload size={18} className="text-red-600" />
        <h4 className="font-medium text-sm">Expense Attachments</h4>
      </div>
      <input
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-900 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-red-50 file:text-red-700 hover:file:bg-red-100 bg-white"
      />
      {files.length > 0 && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white rounded border text-xs"
            >
              <div className="flex items-center gap-1 text-green-600 truncate max-w-[200px] sm:max-w-xs">
                <CheckCircle size={14} />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function NewEntryForm({
  formData,
  setFormData,
  ownedBuses,
  incomeCategories,
  expenseCategories,
  maintenanceCategories,
  updateIncomeAmount,
  updateExpenseAmount,
  updateMaintenanceAmount,
  showAddIncome,
  setShowAddIncome,
  showAddExpense,
  setShowAddExpense,
  showAddMaintenance,
  setShowAddMaintenance,
  newCategoryName,
  setNewCategoryName,
  addNewCategory,
  deleteCategory,
  expenseFiles,
  setExpenseFiles,
  totalIncome,
  totalExpense,
  totalMaintenance,
  balance,
  handleSave,
  saving,
  isOwner,
  duplicateWarnings,
  // Receive staffDetails and setStaffDetails from parent
  staffDetails,
  setStaffDetails,
  dailyCollection,
  setDailyCollection,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [maintenanceOpen, setMaintenanceOpen] = useState(true);
  
  // Battha calculation state
  const [batthaLoading, setBatthaLoading] = useState(false);
  const [batthaCalculations, setBatthaCalculations] = useState({
    hasConfig: false,
    driver: { percentage: 0, amount: 0, isCalculated: false },
    conductor: { percentage: 0, amount: 0, isCalculated: false },
    cleaner: { percentage: 0, amount: 0, isCalculated: false }
  });
  const [batthaError, setBatthaError] = useState(null);
  const [showBatthaWarning, setShowBatthaWarning] = useState(false);

  // Calculate staff salaries from backend
  const calculateStaffSalaries = useCallback(async () => {
    if (!formData.bus || !dailyCollection || parseFloat(dailyCollection) <= 0) {
      return {
        hasConfig: false,
        driver: { percentage: 0, amount: 0, isCalculated: false },
        conductor: { percentage: 0, amount: 0, isCalculated: false },
        cleaner: { percentage: 0, amount: 0, isCalculated: false }
      };
    }
   
    setBatthaLoading(true);
    setBatthaError(null);
   
    try {
      const employeeTypes = [];
      if (staffDetails.driverName) employeeTypes.push("DRIVER");
      if (staffDetails.conductorName) employeeTypes.push("CONDUCTOR");
      if (staffDetails.cleanerName) employeeTypes.push("CLEANER");
     
      if (employeeTypes.length === 0) {
        setBatthaLoading(false);
        return {
          hasConfig: false,
          driver: { percentage: 0, amount: 0, isCalculated: false },
          conductor: { percentage: 0, amount: 0, isCalculated: false },
          cleaner: { percentage: 0, amount: 0, isCalculated: false }
        };
      }
     
      // Using axiosInstance to calculate battha
      const response = await axiosInstance.post('/buses/battha/calculate/', {
        bus_id: formData.bus,
        daily_collection: dailyCollection,
        employee_types: employeeTypes
      });
     
      const data = response.data;
     
      // If no battha configuration exists
      if (!data.has_battha_config) {
        setBatthaCalculations({
          hasConfig: false,
          driver: { percentage: 0, amount: 0, isCalculated: false },
          conductor: { percentage: 0, amount: 0, isCalculated: false },
          cleaner: { percentage: 0, amount: 0, isCalculated: false }
        });
        setShowBatthaWarning(true);
        setBatthaLoading(false);
        return {
          hasConfig: false,
          driver: { percentage: 0, amount: 0, isCalculated: false },
          conductor: { percentage: 0, amount: 0, isCalculated: false },
          cleaner: { percentage: 0, amount: 0, isCalculated: false }
        };
      }
     
      // Format the data
      const calculations = {
        hasConfig: true,
        driver: data.driver || { percentage: 0, amount: 0, isCalculated: false },
        conductor: data.conductor || { percentage: 0, amount: 0, isCalculated: false },
        cleaner: data.cleaner || { percentage: 0, amount: 0, isCalculated: false }
      };
     
      // Mark as calculated
      if (calculations.driver && calculations.driver.amount > 0) {
        calculations.driver.isCalculated = true;
      }
      if (calculations.conductor && calculations.conductor.amount > 0) {
        calculations.conductor.isCalculated = true;
      }
      if (calculations.cleaner && calculations.cleaner.amount > 0) {
        calculations.cleaner.isCalculated = true;
      }
     
      setBatthaCalculations(calculations);
      setShowBatthaWarning(false);
      setBatthaLoading(false);
     
      return calculations;
    } catch (error) {
      console.error('Error calculating battha:', error);
      setBatthaError('Failed to calculate commission rates.');
      setShowBatthaWarning(true);
      setBatthaLoading(false);
     
      return {
        hasConfig: false,
        driver: { percentage: 0, amount: 0, isCalculated: false },
        conductor: { percentage: 0, amount: 0, isCalculated: false },
        cleaner: { percentage: 0, amount: 0, isCalculated: false }
      };
    }
  }, [formData.bus, dailyCollection, staffDetails]);

  // Apply calculated salaries to expense categories
  const applyCalculatedSalaries = useCallback((calculations) => {
    if (!calculations.hasConfig) return;
   
    // Update driver salary if calculated
    if (staffDetails.driverName && calculations.driver.isCalculated) {
      const driverCat = expenseCategories.find(c => c.name === "Driver Salary");
      if (driverCat && calculations.driver.amount > 0) {
        updateExpenseAmount(driverCat.id, calculations.driver.amount);
      }
    }
   
    // Update conductor salary if calculated
    if (staffDetails.conductorName && calculations.conductor.isCalculated) {
      const conductorCat = expenseCategories.find(c => c.name === "Conductor Salary");
      if (conductorCat && calculations.conductor.amount > 0) {
        updateExpenseAmount(conductorCat.id, calculations.conductor.amount);
      }
    }
   
    // Update cleaner salary if calculated
    if (staffDetails.cleanerName && calculations.cleaner.isCalculated) {
      const cleanerCat = expenseCategories.find(c => c.name === "Cleaner Salary");
      if (cleanerCat && calculations.cleaner.amount > 0) {
        updateExpenseAmount(cleanerCat.id, calculations.cleaner.amount);
      }
    }
  }, [staffDetails, expenseCategories, updateExpenseAmount]);

  // Auto-calculate battha when moving to Step 3
  useEffect(() => {
    if (currentStep === 3 && formData.bus && dailyCollection) {
      const autoCalculate = async () => {
        const calculations = await calculateStaffSalaries();
        applyCalculatedSalaries(calculations);
      };
      autoCalculate();
    }
  }, [currentStep, formData.bus, dailyCollection]);

  // Update daily collection in income categories
  useEffect(() => {
    if (dailyCollection && incomeCategories.length > 0) {
      const dailyCollectionCat = incomeCategories.find(c => c.name === "Daily Collection");
      if (dailyCollectionCat) {
        updateIncomeAmount(dailyCollectionCat.id, dailyCollection);
      }
    }
  }, [dailyCollection]);

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.date || !formData.bus) {
        alert("Please select date and bus");
        return false;
      }
      if (!dailyCollection || parseFloat(dailyCollection) <= 0) {
        alert("Please enter daily collection amount");
        return false;
      }
      return true;
    }
   
    if (step === 2) {
      if (!staffDetails.driverName.trim()) {
        alert("Driver name is required");
        return false;
      }
      if (!staffDetails.conductorName.trim()) {
        alert("Conductor name is required");
        return false;
      }
      return true;
    }
   
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6 px-4">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep >= step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
            <div className="text-xs mt-1 font-medium text-gray-600 hidden sm:block">
              {step === 1 && "Collection"}
              {step === 2 && "Staff Names"}
              {step === 3 && "Expenses"}
            </div>
          </div>
          {step < 3 && (
            <div
              className={`w-16 sm:w-24 h-1 mx-2 transition-all ${
                currentStep > step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Function to handle salary amount change
  const handleSalaryChange = (categoryName, value) => {
    const salaryCat = expenseCategories.find(c => c.name === categoryName);
    if (salaryCat) {
      updateExpenseAmount(salaryCat.id, value);
     
      // If user manually changes value, mark as not calculated
      if (categoryName === "Driver Salary" && batthaCalculations.driver.isCalculated) {
        setBatthaCalculations(prev => ({
          ...prev,
          driver: { ...prev.driver, isCalculated: false }
        }));
      } else if (categoryName === "Conductor Salary" && batthaCalculations.conductor.isCalculated) {
        setBatthaCalculations(prev => ({
          ...prev,
          conductor: { ...prev.conductor, isCalculated: false }
        }));
      } else if (categoryName === "Cleaner Salary" && batthaCalculations.cleaner.isCalculated) {
        setBatthaCalculations(prev => ({
          ...prev,
          cleaner: { ...prev.cleaner, isCalculated: false }
        }));
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Step Indicator */}
      <div className="px-4 sm:px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <StepIndicator />
      </div>
     
      {/* Step 1: Daily Collection */}
      {currentStep === 1 && (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100">
              <Wallet className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daily Collection</h2>
              <p className="text-sm text-gray-600">Enter today's collection details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Number <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.bus}
                onChange={(e) => setFormData({ ...formData, bus: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="">Select Bus</option>
                {ownedBuses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.bus_name} ({bus.registration_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Collection Amount <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <IndianRupee size={18} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={dailyCollection}
                  onChange={(e) => setDailyCollection(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                />
              </div>
              {dailyCollection && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Collection: ₹{parseFloat(dailyCollection).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
            >
              Next: Staff Names
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
     
      {/* Step 2: Staff Names (ONLY names, no salaries) */}
      {currentStep === 2 && (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Staff Details</h2>
              <p className="text-sm text-gray-600">Enter staff member names for today</p>
            </div>
          </div>
         
          <div className="space-y-6">
            {/* Driver */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-blue-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Driver Name <span className="text-red-600">*</span>
                </label>
              </div>
              <input
                type="text"
                value={staffDetails.driverName}
                onChange={(e) =>
                  setStaffDetails({ ...staffDetails, driverName: e.target.value })
                }
                placeholder="Enter driver's name"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be saved as today's driver assignment
              </p>
            </div>
           
            {/* Conductor */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-green-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Conductor Name <span className="text-red-600">*</span>
                </label>
              </div>
              <input
                type="text"
                value={staffDetails.conductorName}
                onChange={(e) =>
                  setStaffDetails({ ...staffDetails, conductorName: e.target.value })
                }
                placeholder="Enter conductor's name"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be saved as today's conductor assignment
              </p>
            </div>
           
            {/* Cleaner (Optional) */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-orange-600" />
                <label className="block text-sm font-medium text-gray-700">
                  Cleaner Name <span className="text-gray-500">(Optional)</span>
                </label>
              </div>
              <input
                type="text"
                value={staffDetails.cleanerName}
                onChange={(e) =>
                  setStaffDetails({ ...staffDetails, cleanerName: e.target.value })
                }
                placeholder="Enter cleaner's name (if applicable)"
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be saved as today's cleaner assignment
              </p>
            </div>
          </div>
         
          <div className="mt-8 flex justify-between">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
            >
              Next: Expenses
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
     
      {/* Step 3: Expenses (with salary categories) */}
      {currentStep === 3 && (
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
              <p className="text-sm text-gray-600">Review and add expenses</p>
            </div>
          </div>
         
          {showBatthaWarning && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 text-sm mb-1">No Commission Configuration</h4>
                  <p className="text-yellow-700 text-sm">
                    No commission rates configured for this bus. Please enter salaries manually in the Staff Salaries section below.
                  </p>
                  <button
                    type="button"
                    onClick={calculateStaffSalaries}
                    disabled={batthaLoading}
                    className="mt-2 text-xs text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-1"
                  >
                    {batthaLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    Check for Commission Rates
                  </button>
                </div>
              </div>
            </div>
          )}
         
          {batthaError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 text-sm mb-1">Calculation Error</h4>
                  <p className="text-red-700 text-sm">{batthaError}</p>
                </div>
              </div>
            </div>
          )}
         
          {/* Staff Salaries Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users size={18} />
                Staff Salaries
                {batthaLoading && (
                  <span className="text-xs font-normal text-blue-600">
                    <Loader2 size={12} className="animate-spin inline mr-1" />
                    Calculating...
                  </span>
                )}
              </h3>
              {batthaCalculations.hasConfig && (
                <button
                  type="button"
                  onClick={() => {
                    calculateStaffSalaries().then(calculations => {
                      applyCalculatedSalaries(calculations);
                    });
                  }}
                  disabled={batthaLoading}
                  className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                >
                  {batthaLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  Recalculate Commission
                </button>
              )}
            </div>
           
            {/* Display staff names entered in Step 2 */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-900">Today's Staff Assignments</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Will be saved to database
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {staffDetails.driverName && (
                  <div className="bg-white p-2 rounded border">
                    <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                      <User size={12} />
                      Driver
                    </div>
                    <div className="text-sm text-gray-900 mt-1">{staffDetails.driverName}</div>
                  </div>
                )}
                {staffDetails.conductorName && (
                  <div className="bg-white p-2 rounded border">
                    <div className="text-xs text-green-700 font-medium flex items-center gap-1">
                      <User size={12} />
                      Conductor
                    </div>
                    <div className="text-sm text-gray-900 mt-1">{staffDetails.conductorName}</div>
                  </div>
                )}
                {staffDetails.cleanerName && (
                  <div className="bg-white p-2 rounded border">
                    <div className="text-xs text-orange-700 font-medium flex items-center gap-1">
                      <User size={12} />
                      Cleaner
                    </div>
                    <div className="text-sm text-gray-900 mt-1">{staffDetails.cleanerName}</div>
                  </div>
                )}
              </div>
            </div>
           
            {/* Salary Inputs - Consistent with other expenses */}
            <div className="space-y-2 mb-4">
              {staffDetails.driverName && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-700 font-medium truncate">
                      Driver Salary
                      <div className="text-xs text-gray-500 font-normal">
                        {staffDetails.driverName}
                      </div>
                    </div>
                    {batthaCalculations.driver.isCalculated && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                        {batthaCalculations.driver.percentage}% Commission
                      </span>
                    )}
                  </div>
                  <NumberInput
                    value={(() => {
                      const driverCat = expenseCategories.find(c => c.name === "Driver Salary");
                      return driverCat?.amount || 0;
                    })()}
                    onChange={(v) => handleSalaryChange("Driver Salary", v)}
                  />
                  {isOwner && (
                    <button
                      onClick={() => {
                        const driverCat = expenseCategories.find(c => c.name === "Driver Salary");
                        if (driverCat) {
                          deleteCategory(driverCat.id, "EXPENSE");
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
             
              {staffDetails.conductorName && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded">
                      <User size={14} className="text-green-600" />
                    </div>
                    <div className="text-sm text-gray-700 font-medium truncate">
                      Conductor Salary
                      <div className="text-xs text-gray-500 font-normal">
                        {staffDetails.conductorName}
                      </div>
                    </div>
                    {batthaCalculations.conductor.isCalculated && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                        {batthaCalculations.conductor.percentage}% Commission
                      </span>
                    )}
                  </div>
                  <NumberInput
                    value={(() => {
                      const conductorCat = expenseCategories.find(c => c.name === "Conductor Salary");
                      return conductorCat?.amount || 0;
                    })()}
                    onChange={(v) => handleSalaryChange("Conductor Salary", v)}
                  />
                  {isOwner && (
                    <button
                      onClick={() => {
                        const conductorCat = expenseCategories.find(c => c.name === "Conductor Salary");
                        if (conductorCat) {
                          deleteCategory(conductorCat.id, "EXPENSE");
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
             
              {staffDetails.cleanerName && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded">
                      <User size={14} className="text-orange-600" />
                    </div>
                    <div className="text-sm text-gray-700 font-medium truncate">
                      Cleaner Salary
                      <div className="text-xs text-gray-500 font-normal">
                        {staffDetails.cleanerName}
                      </div>
                    </div>
                    {batthaCalculations.cleaner.isCalculated && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded ml-2">
                        {batthaCalculations.cleaner.percentage}% Commission
                      </span>
                    )}
                  </div>
                  <NumberInput
                    value={(() => {
                      const cleanerCat = expenseCategories.find(c => c.name === "Cleaner Salary");
                      return cleanerCat?.amount || 0;
                    })()}
                    onChange={(v) => handleSalaryChange("Cleaner Salary", v)}
                  />
                  {isOwner && (
                    <button
                      onClick={() => {
                        const cleanerCat = expenseCategories.find(c => c.name === "Cleaner Salary");
                        if (cleanerCat) {
                          deleteCategory(cleanerCat.id, "EXPENSE");
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
         
          {/* Other Expenses */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Other Expenses</h3>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            {showAddExpense && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900"
                  />
                  <button
                    onClick={() => {
                      setShowAddExpense(false);
                      setNewCategoryName("");
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
                <button
                  onClick={() => addNewCategory("EXPENSE")}
                  className="w-full px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Add Category
                </button>
              </div>
            )}
            <div className="space-y-2">
              {expenseCategories
                .filter(
                  (cat) =>
                    !["Driver Salary", "Conductor Salary", "Cleaner Salary"].includes(
                      cat.name
                    )
                )
                .map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="flex-1 text-sm text-gray-700 font-medium truncate">
                      {cat.name}
                    </div>
                    <NumberInput
                      value={cat.amount}
                      onChange={(v) => updateExpenseAmount(cat.id, v)}
                    />
                    {isOwner && (
                      <button
                        onClick={() => deleteCategory(cat.id, "EXPENSE")}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
         
          {/* Maintenance Section */}
          <div className="mt-6 border-t-2 border-dashed border-orange-400 pt-4">
            <button
              onClick={() => setMaintenanceOpen(!maintenanceOpen)}
              className="w-full flex items-center justify-between text-left font-bold text-orange-700 hover:text-orange-800"
            >
              <div className="flex items-center gap-2">
                <Wrench size={20} />
                Maintenance
                {totalMaintenance > 0 && (
                  <span className="ml-2 text-sm font-normal text-orange-600">
                    ₹{totalMaintenance.toFixed(0)}
                  </span>
                )}
              </div>
              {maintenanceOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            {maintenanceOpen && (
              <div className="mt-4 space-y-3 pl-6 border-l-4 border-orange-400">
                {showAddMaintenance && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Engine Oil, Tyre Change"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900"
                      />
                      <button
                        onClick={() => {
                          setShowAddMaintenance(false);
                          setNewCategoryName("");
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => addNewCategory("MAINTENANCE")}
                      className="w-full px-3 py-1.5 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Add Maintenance Category
                    </button>
                  </div>
                )}
                {maintenanceCategories?.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Wrench size={16} className="text-orange-600" />
                    <div className="flex-1 text-sm text-gray-700 font-medium truncate">
                      {cat.name}
                    </div>
                    <NumberInput
                      value={cat.amount}
                      onChange={(v) => updateMaintenanceAmount(cat.id, v)}
                    />
                    {isOwner && (
                      <button
                        onClick={() => deleteCategory(cat.id, "MAINTENANCE")}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setShowAddMaintenance(true)}
                  className="text-orange-600 text-sm font-medium hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Maintenance Item
                </button>
              </div>
            )}
          </div>
         
          <FileInputSection files={expenseFiles} setFiles={setExpenseFiles} />
         
          {/* Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <IndianRupee size={18} className="text-blue-600" />
              Transaction Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-green-300">
                <div className="text-xs font-medium text-green-700">Income</div>
                <div className="text-xl font-bold text-green-700 mt-1">
                  ₹{totalIncome.toFixed(0)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-red-300">
                <div className="text-xs font-medium text-red-700">Total Expense</div>
                <div className="text-xl font-bold text-red-700 mt-1">
                  ₹{totalExpense.toFixed(0)}
                </div>
              </div>
              <div
                className={`bg-white rounded-lg p-3 border ${
                  balance >= 0 ? "border-green-300" : "border-red-300"
                }`}
              >
                <div
                  className={`text-xs font-medium ${
                    balance >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  Net Balance
                </div>
                <div
                  className={`text-xl font-bold mt-1 ${
                    balance >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {balance >= 0 ? "₹" : "-₹"}
                  {Math.abs(balance).toFixed(0)}
                </div>
              </div>
            </div>
           
            {/* Staff Summary */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="text-xs font-medium text-blue-700 mb-2">
                Staff Assignments (Will be saved)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {staffDetails.driverName && (
                  <div className="bg-blue-50 p-2 rounded border">
                    <div className="text-blue-900 font-medium">Driver</div>
                    <div className="text-blue-700">{staffDetails.driverName}</div>
                  </div>
                )}
                {staffDetails.conductorName && (
                  <div className="bg-green-50 p-2 rounded border">
                    <div className="text-green-900 font-medium">Conductor</div>
                    <div className="text-green-700">{staffDetails.conductorName}</div>
                  </div>
                )}
                {staffDetails.cleanerName && (
                  <div className="bg-orange-50 p-2 rounded border">
                    <div className="text-orange-900 font-medium">Cleaner</div>
                    <div className="text-orange-700">{staffDetails.cleanerName}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
         
          <div className="mt-6 flex justify-between gap-4">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 sm:flex-none sm:px-8 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-98"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Entry
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
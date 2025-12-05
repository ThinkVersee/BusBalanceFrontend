"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { Bus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    business_phone: '',
    license_number: '',
    business_address: '',
    pan_number: '',
    gst_number: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        company_name: formData.company_name.trim(),
        business_phone: formData.business_phone.trim(),
        business_address: formData.business_address.trim(),
        license_number: formData.license_number.trim() || undefined,
        pan_number: formData.pan_number.trim().toUpperCase() || undefined,
        gst_number: formData.gst_number.trim().toUpperCase() || undefined,
      };

      await axiosInstance.post('/owners/register/', payload);

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 4000);

    } catch (err) {
      const errMsg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Registration failed. Please try again.';

      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-3 rounded-2xl shadow-lg">
                <div className="bg-white p-3 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                    <Bus className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">BUSBOOK</h1>
            <p className="text-gray-600 mt-2 text-lg">Register as Bus Owner</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-8 p-6 bg-green-50 border-2 border-green-300 rounded-2xl text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-green-800 font-bold text-xl">Registration Successful!</p>
              <p className="text-green-700 mt-3">
                Your username and password have been sent to
              </p>
              <p className="font-bold text-green-800 text-lg">{formData.email}</p>
              <p className="text-green-600 text-sm mt-4">Redirecting to login in 4 seconds...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-red-800 font-semibold">{error}</div>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {/* Mandatory Fields */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ravi Kumar"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="ravi@example.com"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="Ravi Travels"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Business Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleChange}
                    required
                    placeholder="+919876543210"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Business Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleChange}
                    rows={4}
                    required
                    placeholder="Near Bus Stand, Thrissur, Kerala"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm resize-none"
                  />
                </div>

                {/* Optional Fields */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="KL-07-TR-1234"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm uppercase"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    maxLength={15}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm uppercase"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-300 rounded-xl p-5 text-sm text-blue-800 font-medium">
                Note: Your login credentials (username + temporary password) will be sent to your email after successful registration.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-6 w-6" />
                    Creating Account...
                  </>
                ) : (
                  'Register as Bus Owner'
                )}
              </button>

              <p className="text-center text-gray-600 mt-8">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 font-bold hover:underline">
                  Login here
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Fix for autofill background on Mac */}
      <style jsx global>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #111827 !important;
          caret-color: #111827 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
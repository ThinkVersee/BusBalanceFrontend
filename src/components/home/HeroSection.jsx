// components/HeroSection.jsx
import { Bus } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="home" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Your Bus Business <span className="text-blue-600">Finances</span> Effortlessly
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Stop losing track of expenses and income. Track every rupee, analyze profits, and keep your bus business finances in perfect balance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 shadow-2xl">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">Today's Summary</span>
                <Bus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Income</span>
                  <span className="text-2xl font-bold text-green-600">₹12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Expenses</span>
                  <span className="text-2xl font-bold text-red-600">₹4,320</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Net Profit</span>
                  <span className="text-3xl font-bold text-blue-600">₹8,130</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
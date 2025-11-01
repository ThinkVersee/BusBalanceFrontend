'use client';

import React, { useState } from 'react';
import { Menu, X, Bus, TrendingUp, DollarSign, FileText, BarChart3, Clock, Shield, Smartphone } from 'lucide-react';

export default function BusManagerLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Bus className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">BusBalance</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition">Features</a>
              <a href="#problem" className="text-gray-700 hover:text-blue-600 transition">Solution</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition">Services</a>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#home" className="block text-gray-700 hover:text-blue-600">Home</a>
              <a href="#features" className="block text-gray-700 hover:text-blue-600">Features</a>
              <a href="#problem" className="block text-gray-700 hover:text-blue-600">Solution</a>
              <a href="#services" className="block text-gray-700 hover:text-blue-600">Services</a>
              <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
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
            <div className="relative">
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
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Are You Struggling With These Problems?
            </h2>
            <p className="text-xl text-gray-600">
              Most bus owners face these daily challenges
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lost Track of Money</h3>
              <p className="text-gray-700">
                Forgetting to record fuel expenses, maintenance costs, or daily income leads to confusion and lost profits.
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manual Calculations</h3>
              <p className="text-gray-700">
                Spending hours with pen and paper or spreadsheets trying to calculate daily profits and monthly expenses.
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Clear Picture</h3>
              <p className="text-gray-700">
                Unable to see which buses are profitable, where money is going, and how to improve business performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Simple Solution in One App
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            BusBalance automatically tracks all your income and expenses, calculates profits instantly, and shows you exactly how your business is performing.
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-5xl font-bold text-blue-600 mb-2">2 min</div>
                <div className="text-gray-700">Daily Entry Time</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-700">Accurate Tracking</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-700">Access Anywhere</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Bus Business
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for bus owners
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
              <DollarSign className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Income Tracking</h3>
              <p className="text-gray-600">
                Record daily ticket sales, contract payments, and all revenue streams in seconds.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
              <TrendingUp className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expense Management</h3>
              <p className="text-gray-600">
                Track fuel, maintenance, salaries, permits, and all business expenses automatically.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Profit Analysis</h3>
              <p className="text-gray-600">
                Instant profit calculations with daily, weekly, and monthly reports at your fingertips.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
              <FileText className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Reports</h3>
              <p className="text-gray-600">
                Generate detailed financial reports for tax filing, loans, and business planning.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
              <Clock className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600">
                See your current financial status updated instantly as you add new entries.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
              <Smartphone className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mobile Access</h3>
              <p className="text-gray-600">
                Manage your business on the go from your phone, tablet, or computer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Complete support for your bus business management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Multiple Bus Management</h3>
              <p className="text-gray-600 text-sm">Track unlimited buses in one account</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Secure Data Storage</h3>
              <p className="text-gray-600 text-sm">Your financial data is safe and encrypted</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tax-Ready Reports</h3>
              <p className="text-gray-600 text-sm">Generate reports for easy tax filing</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Business Insights</h3>
              <p className="text-gray-600 text-sm">Get actionable insights to grow profits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Bus Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of bus owners who are already managing their finances better
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg">
            Get Started for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bus className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold">BusManager</span>
              </div>
              <p className="text-gray-400">
                Making bus business management simple and efficient.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BusManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
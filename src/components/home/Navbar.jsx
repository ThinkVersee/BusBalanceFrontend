'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';   // <-- add this
import { Menu, X, Bus } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();                     // <-- add this

  // Re-usable click handler
  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Bus className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BusBalance</span>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition">
              Features
            </a>
            <a href="#problem" className="text-gray-700 hover:text-blue-600 transition">
              Solution
            </a>
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition">
              Services
            </a>

            {/* <-- changed to button with onClick --> */}
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <a href="#home" className="block text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="#features" className="block text-gray-700 hover:text-blue-600">
              Features
            </a>
            <a href="#problem" className="block text-gray-700 hover:text-blue-600">
              Solution
            </a>
            <a href="#services" className="block text-gray-700 hover:text-blue-600">
              Services
            </a>

            {/* <-- changed to button with onClick --> */}
            <button
              onClick={handleGetStarted}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
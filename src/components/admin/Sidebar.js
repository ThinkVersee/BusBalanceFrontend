// components/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer state

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Companies', icon: Building2, path: '/admin/companies' },
    { name: 'Subscription', icon: CreditCard, path: '/admin/subscription' },
    { name: 'Subscribers', icon: Users, path: '/admin/subscribers' },
  ];

  const NavLinks = () => (
    <ul className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <li key={item.path}>
            <Link
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile Hamburger Button (visible only on <md) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-50 border-r border-gray-200 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-64 w-72 flex flex-col`}
      >
        {/* Close Button (mobile only) */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-400 rounded-full" />
            </div>
            <span className="text-xl font-bold text-gray-800">THINK</span>
            <span className="text-xl font-light text-gray-600">VISIBLE</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Logo (desktop only) */}
        <div className="hidden md:block p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 bg-yellow-400 rounded-full" />
            </div>
            <span className="text-xl font-bold text-gray-800">THINK</span>
            <span className="text-xl font-light text-gray-600">VISIBLE</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <NavLinks />
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
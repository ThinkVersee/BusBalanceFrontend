'use client';

import { useState } from 'react';
import BusManagement from '@/components/owner/Bus/Bus';
import Navbar from '@/components/owner/Navbar';
import Sidebar from '@/components/owner/Sidebar';

export default function BusPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="md:ml-64">
        {/* Navbar */}
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="pt-16">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
            <BusManagement />
          </div>
        </main>
      </div>
    </div>
  );
}

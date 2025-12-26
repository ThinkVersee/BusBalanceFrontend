'use client';

import { useState } from 'react';
import SuperadminDashboard from '@/components/admin/Dashboard/Dashboard';
import Navbar from '@/components/admin/Navbar';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Navbar */}
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
         <main className="pt-13 sm:pt-16">
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
            <SuperadminDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}

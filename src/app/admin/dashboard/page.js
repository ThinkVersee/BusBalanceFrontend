'use client';

import SuperadminDashboard from '@/components/admin/Dashboard/Dashboard';
import Navbar from '@/components/admin/Navbar';
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <SuperadminDashboard />
        </div>
      </div>
    </div>
  );
}
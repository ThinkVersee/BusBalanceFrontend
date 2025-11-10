'use client';

import OwnerDashboard from '@/components/owner/Dashboard/Dashboard';
import Navbar from '@/components/owner/Navbar';
import Sidebar from '@/components/owner/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <OwnerDashboard />
        </div>
      </div>
    </div>
  );
}
'use client';

import BusOwnerManagement from '@/components/admin/Companies/Companies';
import Navbar from '@/components/admin/Navbar';
import Sidebar from '@/components/admin/Sidebar';

export default function CompaniesPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <BusOwnerManagement />
        </div>
      </div>
    </div>
  );
}
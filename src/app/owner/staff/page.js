'use client';

import StaffManagement from '@/components/owner/Staff/Staff';
import Navbar from '@/components/owner/Navbar';
import Sidebar from '@/components/owner/Sidebar';

export default function OwnerPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <StaffManagement />
        </div>
      </div>
    </div>
  );
}
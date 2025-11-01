'use client';

import SubscribersManagement from '@/components/admin/Subscribers/Subscribers';
import Navbar from '@/components/admin/Navbar';
import Sidebar from '@/components/admin/Sidebar';

export default function SubscrbersPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <SubscribersManagement />
        </div>
      </div>
    </div>
  );
}
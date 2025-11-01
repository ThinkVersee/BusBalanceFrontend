'use client';

import SubscriptionManagement from '@/components/admin/Subscription/Subscriptions';
import Navbar from '@/components/admin/Navbar';
import Sidebar from '@/components/admin/Sidebar';

export default function SubscriptionPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <SubscriptionManagement />
        </div>
      </div>
    </div>
  );
}
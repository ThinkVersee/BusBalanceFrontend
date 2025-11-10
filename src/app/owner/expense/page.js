'use client';

import BillBookForm from '@/components/finance/BillBookForm';
import Navbar from '@/components/owner/Navbar';
import Sidebar from '@/components/owner/Sidebar';

export default function expensePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="mt-16 p-8">
          <BillBookForm />
        </div>
      </div>
    </div>
  );
}
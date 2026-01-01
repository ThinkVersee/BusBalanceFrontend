'use client';

import { useState } from 'react';
import OwnerDashboard from '@/components/owner/Dashboard/Dashboard';
import Navbar from '@/components/owner/Navbar';
import Sidebar from '@/components/owner/Sidebar';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="md:ml-64">                     
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(true)}
        />
        
        <main className="pt-13 sm:pt-16">                    
          <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">   
            <OwnerDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}
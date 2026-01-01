"use client";

import Navbar from "@/components/employee/Navbar";
import BillBookForm from "@/components/finance/BillBookForm";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar stays on top */}
      <Navbar />

      {/* Page Content */}
      <main className="pt-15 sm:pt-17">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <BillBookForm />
        </div>
      </main>
    </div>
  );
}

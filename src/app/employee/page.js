"use client";

import Navbar from "@/components/employee/Navbar";
import BillBookForm from "@/components/finance/BillBookForm";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Navbar />
      <BillBookForm />
    </div>
  );
}
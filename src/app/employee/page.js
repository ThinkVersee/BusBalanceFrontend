"use client";

import BillBookForm from "@/components/finance/BillBookForm";
import { useAuth } from "@/hooks/useAuth";

export default function EmployeePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <BillBookForm />
    </div>
  );
}
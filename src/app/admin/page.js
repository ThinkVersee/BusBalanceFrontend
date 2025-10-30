"use client";

import Navbar from "@/components/admin/Navbar";
import Sidebar from "@/components/admin/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function SuperadminPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Navbar />
      <Sidebar />

    </div>
  );
}
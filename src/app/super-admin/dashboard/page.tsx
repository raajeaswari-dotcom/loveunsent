"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== "super_admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Super Admin Panel</h1>
      <p>Manage entire system, roles, admins, and all permissions.</p>
    </div>
  );
}
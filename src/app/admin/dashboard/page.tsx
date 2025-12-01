"use client";
import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Here you can manage writers, QC, and orders.</p>
    </div>
  );
}
"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function QCPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== "qc") {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">QC Dashboard</h1>
      <p>Quality checking tasks assigned to you will appear here.</p>
    </div>
  );
}
"use client";
import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function WriterOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div>Loading...</div>;

  if (!user || user.role !== "writer") {
    router.push("/login");
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Writer Orders</h1>
      <p>Welcome, {user.email || user.phone}</p>
      <p>Your assigned writing orders will appear here.</p>
    </div>
  );
}
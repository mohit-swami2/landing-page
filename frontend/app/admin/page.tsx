"use client";

export const dynamic = "force-dynamic";

import "@/features/admin/admin.css";
import { AdminProvider, useAdmin } from "@/features/admin/context/AdminContext";
import { AdminLogin } from "@/features/admin/components/layout/AdminLogin";
import { AdminLoading } from "@/features/admin/components/layout/AdminLoading";
import { AdminShell } from "@/features/admin/components/layout/AdminShell";

function AdminPageContent() {
  const { authReady, token } = useAdmin();

  if (!authReady) return <AdminLoading />;
  if (!token) return <AdminLogin />;
  return <AdminShell />;
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminPageContent />
    </AdminProvider>
  );
}

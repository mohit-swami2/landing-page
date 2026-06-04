"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAdminPage } from "../hooks/useAdminPage";

export type AdminContextValue = ReturnType<typeof useAdminPage>;

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const value = useAdminPage();
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}

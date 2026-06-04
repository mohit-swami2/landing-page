"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import "@/features/admin/admin.css";
import { AdminButton } from "@/features/admin/components/ui/AdminButton";
import { AdminInput } from "@/features/admin/components/ui/AdminInput";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password })
      });
      setMessage("Password reset successful. You can login now.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_50%)]" />
      <form onSubmit={onSubmit} className="relative w-full max-w-md admin-glow-card-strong rounded-3xl p-8 space-y-5">
        <h1 className="text-xl font-bold text-white">Reset Password</h1>
        <p className="text-sm text-slate-400">Enter your new password below</p>
        <AdminInput type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <AdminButton type="submit" className="w-full py-3">
          Reset Password
        </AdminButton>
        {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen admin-root flex items-center justify-center text-slate-400">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

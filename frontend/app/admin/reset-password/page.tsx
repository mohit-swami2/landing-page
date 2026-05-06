"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 bg-slate-900/60 p-6 rounded-xl border border-slate-700">
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <input className="w-full p-3 rounded bg-slate-800 border border-slate-700" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full p-3 rounded bg-gradient-to-r from-purple-600 to-cyan-500" type="submit">
          Reset Password
        </button>
        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading...</main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

"use client";

import { apiFetch } from "@/lib/api";
import { AdminButton } from "../ui/AdminButton";
import { AdminInput } from "../ui/AdminInput";
import { useAdmin } from "../../context/AdminContext";

export function AdminLogin() {
  const { email, setEmail, password, setPassword, isPending, runAction, setToken } = useAdmin();

  return (
    <main className="admin-root min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.08),transparent_50%)]" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runAction("login", async () => {
            const data = await apiFetch("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email, password })
            });
            sessionStorage.setItem("admin-token", data.token);
            setToken(data.token);
          }, "Login successful");
        }}
        className="relative w-full max-w-md admin-glow-card-strong rounded-3xl p-8 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-[0_0_16px_rgba(34,211,238,0.5)]">
            M
          </div>
          <div>
            <p className="font-semibold text-white">mohitswami.in</p>
            <p className="text-xs text-slate-400">Admin Portal</p>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
            <AdminInput
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Password</label>
            <AdminInput
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <AdminButton type="submit" disabled={isPending("login")} className="w-full py-3">
          {isPending("login") ? "Signing in..." : "Sign In"}
        </AdminButton>
      </form>
    </main>
  );
}

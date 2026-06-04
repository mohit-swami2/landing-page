"use client";

import { useEffect } from "react";
import type { ToastItem } from "../../types";

export function AdminToastViewport({
  toasts,
  onDismiss
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItemView({
  toast,
  onDismiss
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.durationMs ?? 3200);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg animate-[adminToastIn_0.3s_ease-out] ${
        isSuccess
          ? "bg-[#0d1f1a]/95 text-emerald-100 border-emerald-500/45 shadow-[0_0_24px_rgba(52,211,153,0.15)]"
          : "bg-[#1f0d14]/95 text-rose-100 border-rose-500/45 shadow-[0_0_24px_rgba(244,63,94,0.15)]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isSuccess ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
        }`}
      >
        {isSuccess ? "✓" : "!"}
      </span>
      <p className="flex-1 leading-snug pt-0.5">{toast.text}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-white transition text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

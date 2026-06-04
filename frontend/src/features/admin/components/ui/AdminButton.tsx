import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:brightness-110 border-transparent",
  secondary:
    "bg-[#0a1220] border-cyan-500/30 text-cyan-100 hover:border-cyan-400/50 hover:bg-cyan-500/10",
  ghost: "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800/80",
  danger: "bg-rose-950/50 border-rose-500/40 text-rose-300 hover:bg-rose-500/15",
  success: "bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15"
};

export function AdminButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      className={`px-4 py-2 rounded-xl border text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

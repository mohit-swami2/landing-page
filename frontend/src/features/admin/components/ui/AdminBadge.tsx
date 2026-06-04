const styles = {
  default: "border-cyan-500/35 text-cyan-200 bg-cyan-500/10",
  success: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  warning: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  danger: "border-rose-500/40 text-rose-300 bg-rose-500/10",
  muted: "border-slate-500/40 text-slate-400 bg-slate-500/10",
  featured: "border-purple-500/40 text-purple-300 bg-purple-500/10"
};

export function AdminBadge({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: keyof typeof styles;
}) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[tone]}`}>{children}</span>
  );
}

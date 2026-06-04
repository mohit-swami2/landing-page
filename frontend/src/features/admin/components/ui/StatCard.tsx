export function StatCard({
  label,
  value,
  sub,
  trend
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
}) {
  return (
    <div className="admin-glow-card rounded-2xl p-4 relative overflow-hidden group hover:border-cyan-400/35 transition">
      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-2xl" />
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-white mt-2">{value}</p>
      {sub ? <p className="text-xs text-slate-400 mt-1">{sub}</p> : null}
      {trend ? <p className="text-xs text-emerald-400 mt-2">{trend}</p> : null}
    </div>
  );
}

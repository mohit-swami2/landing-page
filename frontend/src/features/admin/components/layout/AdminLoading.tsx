export function AdminLoading({ label = "Loading admin..." }: { label?: string }) {
  return (
    <main className="admin-root min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-11 w-11 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </main>
  );
}

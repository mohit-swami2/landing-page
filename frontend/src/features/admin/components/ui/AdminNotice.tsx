import type { Notice } from "../../types";

export function AdminNotice({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm border ${
        notice.type === "success"
          ? "bg-emerald-950/50 text-emerald-200 border-emerald-500/40"
          : "bg-rose-950/50 text-rose-200 border-rose-500/40"
      }`}
    >
      {notice.text}
    </div>
  );
}

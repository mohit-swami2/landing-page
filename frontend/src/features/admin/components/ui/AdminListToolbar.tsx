import { Search } from "lucide-react";
import type { StatusFilter } from "../../types";
import { AdminSelect } from "./AdminInput";

export function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  status,
  onStatusChange,
  statusOptions,
  count,
  total
}: {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder: string;
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  statusOptions: { value: StatusFilter; label: string }[];
  count: number;
  total: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl admin-glow-card">
      <div className="relative flex-1 admin-search">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/70 pointer-events-none" size={16} />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="admin-search-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder:text-slate-400 outline-none transition"
        />
      </div>
      <AdminSelect value={status} onChange={(e) => onStatusChange(e.target.value)}>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </AdminSelect>
      <p className="text-xs text-slate-500 self-center sm:ml-auto whitespace-nowrap">
        Showing {count} of {total}
      </p>
    </div>
  );
}

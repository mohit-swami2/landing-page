import type { StatusFilter } from "../../types";
import { AdminInput, AdminSelect } from "./AdminInput";

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
      <AdminInput type="search" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} />
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

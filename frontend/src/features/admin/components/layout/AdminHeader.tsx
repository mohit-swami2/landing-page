"use client";

import { Search } from "lucide-react";
import { NAV_ITEMS } from "../../constants";
import { useAdmin } from "../../context/AdminContext";

export function AdminHeader() {
  const { tab, headerSearch, setHeaderSearch, stalePendingQueries, unseenQueryCount } = useAdmin();
  const title = NAV_ITEMS.find((n) => n.id === tab)?.label || "Dashboard";
  const notificationCount = stalePendingQueries.length + unseenQueryCount;

  return (
    <header className="admin-glow-card admin-header-sticky rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4 sticky top-0 lg:top-4 z-30">
      <h2 className="text-xl font-bold text-white shrink-0">{title}</h2>

      <div className="flex-1 max-w-xl mx-auto w-full relative admin-search">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/70 pointer-events-none" size={17} />
        <input
          type="search"
          value={headerSearch}
          onChange={(e) => setHeaderSearch(e.target.value)}
          placeholder="Search anything..."
          className="admin-search-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder:text-slate-400 outline-none transition"
        />
      </div>

      <div className="flex items-center gap-4 shrink-0 ml-auto">
        <button
          type="button"
          className="relative h-10 w-10 rounded-xl border border-cyan-500/25 bg-[#0a1220] flex items-center justify-center text-slate-300 hover:border-cyan-400/40 transition"
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
          {notificationCount > 0 ? (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-cyan-500/20">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-[0_0_12px_rgba(34,211,238,0.4)]">
            MS
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">Mohit Swami</p>
            <p className="text-xs text-slate-500">Admin</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { apiFetch } from "@/lib/api";
import { THEME_PRESETS } from "../constants";
import { useAdmin } from "../context/AdminContext";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminCard } from "../components/ui/AdminCard";
import { AdminInput } from "../components/ui/AdminInput";

export function ThemeSection() {
  const { theme, setTheme, themeSearch, setThemeSearch, filteredThemePresets, runAction, loadAll, token, isPending } =
    useAdmin();

  return (
    <AdminCard glow className="flex flex-col max-h-[calc(100vh-5rem)]" scrollable maxHeight="calc(100vh - 5rem)">
      <h2 className="font-semibold flex-shrink-0 mb-3 text-white">Select Built-in Theme</h2>
      <div className="flex-shrink-0 mb-3 space-y-2">
        <AdminInput
          type="search"
          value={themeSearch}
          onChange={(e) => setThemeSearch(e.target.value)}
          placeholder="Filter themes by name..."
        />
        <p className="text-xs text-slate-400">
          Active:{" "}
          <span className="text-cyan-300">{THEME_PRESETS.find((p) => p.key === theme.themeKey)?.name || theme.themeKey}</span>
          {" · "}
          Showing {filteredThemePresets.length} of {THEME_PRESETS.length}
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto admin-scrollbar overscroll-contain pr-1 -mr-1">
        {filteredThemePresets.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No themes match your search.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-2 pb-1">
            {filteredThemePresets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={`text-left p-3 rounded-xl border transition ${
                  theme.themeKey === preset.key
                    ? "border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "border-cyan-500/20 bg-[#0a1220] hover:border-cyan-400/50"
                }`}
                onClick={() => setTheme({ themeKey: preset.key })}
              >
                <p className="text-sm font-medium text-slate-100">{preset.name}</p>
                <div className="h-8 rounded-lg mt-2" style={{ background: preset.preview }} />
              </button>
            ))}
          </div>
        )}
      </div>
      <AdminButton
        className="flex-shrink-0 mt-3 w-fit"
        disabled={isPending("theme.save")}
        onClick={() =>
          runAction(
            "theme.save",
            async () => {
              await apiFetch("/theme", { method: "PUT", body: JSON.stringify(theme) }, token);
              window.localStorage.setItem("lp_theme_key", theme.themeKey);
              await loadAll(token);
            },
            "Theme updated"
          )
        }
      >
        {isPending("theme.save") ? "Saving..." : "Save Theme"}
      </AdminButton>
    </AdminCard>
  );
}

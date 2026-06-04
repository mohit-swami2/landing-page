"use client";

import { NAV_ITEMS } from "../../constants";
import { useAdmin } from "../../context/AdminContext";
import { AdminButton } from "../ui/AdminButton";
import { AdminHeader } from "./AdminHeader";
import { AboutSection } from "../../sections/AboutSection";
import { AnalyticsSection } from "../../sections/AnalyticsSection";
import { DashboardSection } from "../../sections/DashboardSection";
import { HeroSection } from "../../sections/HeroSection";
import { ProjectsSection } from "../../sections/ProjectsSection";
import { QueriesSection } from "../../sections/QueriesSection";
import { SocialSection } from "../../sections/SocialSection";
import { ThemeSection } from "../../sections/ThemeSection";
import type { AdminTab } from "../../types";

const SECTIONS: Record<AdminTab, () => React.ReactNode> = {
  dashboard: () => <DashboardSection />,
  projects: () => <ProjectsSection />,
  about: () => <AboutSection />,
  social: () => <SocialSection />,
  queries: () => <QueriesSection />,
  theme: () => <ThemeSection />,
  hero: () => <HeroSection />,
  analytics: () => <AnalyticsSection />
};

export function AdminShell() {
  const {
    tab,
    setTab,
    logout,
    dataLoading,
    stalePendingQueries,
    unseenQueryCount
  } = useAdmin();

  const Section = SECTIONS[tab];

  return (
    <main className="admin-root min-h-screen relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.08),transparent_45%)] pointer-events-none" />
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 grid lg:grid-cols-[260px_1fr] gap-6 relative">
        <aside className="admin-glow-card rounded-2xl p-4 h-fit md:sticky md:top-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_14px_rgba(34,211,238,0.45)]">
              M
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">mohitswami.in</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between gap-2 text-sm ${
                  tab === item.id ? "admin-nav-active text-cyan-100" : "text-slate-400 hover:text-cyan-200 hover:bg-cyan-500/5"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-cyan-500/80 w-4 text-center">{item.icon}</span>
                  {item.label}
                </span>
                {item.id === "dashboard" && stalePendingQueries.length > 0 ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-semibold min-w-[1.25rem] text-center">
                    {stalePendingQueries.length}
                  </span>
                ) : null}
                {item.id === "queries" && unseenQueryCount > 0 ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-semibold min-w-[1.25rem] text-center">
                    {unseenQueryCount}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          <AdminButton type="button" variant="ghost" className="mt-4 w-full" onClick={logout}>
            Logout
          </AdminButton>
        </aside>

        <div className="space-y-4 relative min-w-0 flex flex-col">
          <AdminHeader />
          <section className="space-y-4 relative flex-1 min-h-0">
          {dataLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#060b14]/60 backdrop-blur-[2px]">
              <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            </div>
          ) : null}
          <Section />
          </section>
        </div>
      </div>
    </main>
  );
}

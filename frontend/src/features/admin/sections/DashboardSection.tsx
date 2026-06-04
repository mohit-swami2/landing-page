"use client";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import { CHART_OPTIONS, DOUGHNUT_OPTIONS } from "../constants";
import { useAdmin } from "../context/AdminContext";
import { AdminButton } from "../components/ui/AdminButton";
import { AdminCard } from "../components/ui/AdminCard";
import { StatCard } from "../components/ui/StatCard";
import { apiFetch } from "@/lib/api";
import type { AdminTab } from "../types";

export function DashboardSection() {
  const {
    projects,
    queries,
    socials,
    theme,
    hero,
    about,
    analytics,
    unseenQueryCount,
    stalePendingQueries,
    recentPendingQueries,
    dashboardStats,
    contentOverviewChart,
    projectStatusChart,
    queryStatusChart,
    queriesTrendChart,
    analyticsChart,
    setTab,
    isPending,
    runAction,
    loadAll,
    token,
    daysSince
  } = useAdmin();

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">Portfolio overview, analytics, and action items · {new Date().toLocaleString()}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Projects" value={projects.length} sub={`${dashboardStats.publicProjects} public`} />
        <StatCard label="Queries" value={queries.length} sub={`${unseenQueryCount} pending`} />
        <StatCard label="Social links" value={socials.length} sub={`${dashboardStats.visibleSocials} visible`} />
        <StatCard label="Visitors" value={analytics.uniqueVisitors} sub="unique sessions" />
        <StatCard label="Avg session" value={`${analytics.averageSessionDurationSeconds}s`} sub="site engagement" />
        <StatCard label="Stale pending" value={stalePendingQueries.length} sub="2+ days unread" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <AdminCard glow className="lg:col-span-2 border-amber-500/30 !bg-gradient-to-br from-amber-950/40 to-[#0a1220]/90 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-amber-100 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                Notifications
              </h3>
              <p className="text-xs text-slate-400 mt-1">Pending queries older than 2 days need your attention</p>
            </div>
            {stalePendingQueries.length > 0 ? (
              <AdminButton type="button" variant="secondary" className="text-xs py-1.5" onClick={() => setTab("queries")}>
                View all queries
              </AdminButton>
            ) : null}
          </div>
          {stalePendingQueries.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-cyan-500/20 rounded-xl">
              No stale pending queries. You are all caught up.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto admin-scrollbar pr-1">
              {stalePendingQueries.map((q) => (
                <div
                  key={q._id}
                  className="p-3 rounded-xl border border-amber-500/25 bg-[#0a1220]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100">
                      {q.name}{" "}
                      <span className="text-amber-300 text-xs font-normal">
                        · {daysSince(q.createdAt)} days ago · pending
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 truncate">{q.email}</p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-1">{q.message}</p>
                  </div>
                  <AdminButton
                    type="button"
                    variant="success"
                    className="text-xs shrink-0"
                    disabled={isPending(`query.status.${q._id}`)}
                    onClick={() =>
                      runAction(`query.status.${q._id}`, async () => {
                        await apiFetch(
                          `/queries/${q._id}/status`,
                          { method: "PATCH", body: JSON.stringify({ status: "seen" }) },
                          token
                        );
                        await loadAll(token);
                      }, "Marked as read")
                    }
                  >
                    Mark read
                  </AdminButton>
                </div>
              ))}
            </div>
          )}
          {recentPendingQueries.length > 0 ? (
            <div className="pt-3 border-t border-cyan-500/15">
              <p className="text-xs text-slate-500 mb-2">Recent pending (under 2 days) — {recentPendingQueries.length}</p>
              <div className="flex flex-wrap gap-2">
                {recentPendingQueries.slice(0, 4).map((q) => (
                  <span key={q._id} className="text-xs px-2 py-1 rounded-full bg-[#0a1220] border border-cyan-500/25 text-slate-300">
                    {q.name}
                  </span>
                ))}
                {recentPendingQueries.length > 4 ? (
                  <span className="text-xs text-slate-500">+{recentPendingQueries.length - 4} more</span>
                ) : null}
              </div>
            </div>
          ) : null}
        </AdminCard>

        <AdminCard className="space-y-3">
          <h3 className="font-semibold text-cyan-100">Current theme</h3>
          <div
            className="h-24 rounded-xl border border-cyan-500/25"
            style={{ background: dashboardStats.activeTheme?.preview || "linear-gradient(135deg,#5b21b6,#0891b2)" }}
          />
          <p className="text-lg font-medium text-cyan-200">{dashboardStats.activeTheme?.name || theme.themeKey}</p>
          <p className="text-xs text-slate-500 font-mono">{theme.themeKey}</p>
          <AdminButton type="button" variant="secondary" className="w-full" onClick={() => setTab("theme")}>
            Change theme
          </AdminButton>
        </AdminCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AdminCard>
          <h3 className="font-semibold text-cyan-100 mb-3 text-sm">Content overview</h3>
          <div className="h-56">
            <Bar data={contentOverviewChart} options={CHART_OPTIONS} />
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="font-semibold text-cyan-100 mb-3 text-sm">Site analytics</h3>
          <div className="h-56">
            <Bar data={analyticsChart} options={CHART_OPTIONS} />
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="font-semibold text-cyan-100 mb-3 text-sm">Project visibility</h3>
          <div className="h-52">
            <Doughnut data={projectStatusChart} options={DOUGHNUT_OPTIONS} />
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="font-semibold text-cyan-100 mb-3 text-sm">Query status</h3>
          <div className="h-52">
            <Doughnut data={queryStatusChart} options={DOUGHNUT_OPTIONS} />
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="font-semibold text-cyan-100 mb-3">Queries — last 7 days</h3>
        <div className="h-52">
          <Line data={queriesTrendChart} options={CHART_OPTIONS} />
        </div>
      </AdminCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "About", detail: about.bio ? "Content ready" : "Needs content", tab: "about" as AdminTab },
          { label: "Hero", detail: hero.headlineLine1 ? "Content ready" : "Needs content", tab: "hero" as AdminTab },
          { label: "Projects", detail: `${projects.length} project${projects.length === 1 ? "" : "s"}`, tab: "projects" as AdminTab },
          { label: "Social", detail: `${socials.length} link${socials.length === 1 ? "" : "s"}`, tab: "social" as AdminTab }
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setTab(item.tab)}
            className="admin-glow-card rounded-2xl p-4 hover:border-cyan-400/40 text-left transition"
          >
            <p className="text-xs text-slate-400">{item.label} section</p>
            <p className="text-lg font-semibold text-white mt-1">{item.detail}</p>
            <p className="text-xs text-cyan-400 mt-2">Manage →</p>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Bar } from "react-chartjs-2";
import { CHART_OPTIONS } from "../constants";
import { useAdmin } from "../context/AdminContext";
import { AdminCard } from "../components/ui/AdminCard";

export function AnalyticsSection() {
  const { analytics, analyticsChart } = useAdmin();

  return (
    <AdminCard glow className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-white">Analytics</h2>
        <span className="text-xs text-slate-400">Read-only · live from visitor tracking</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="admin-glow-card rounded-xl p-4">
          <p className="text-sm text-slate-300">Unique Visitors</p>
          <p className="text-3xl font-bold text-cyan-100">{analytics.uniqueVisitors}</p>
        </div>
        <div className="admin-glow-card rounded-xl p-4">
          <p className="text-sm text-slate-300">Average Session Duration</p>
          <p className="text-3xl font-bold text-cyan-100">{analytics.averageSessionDurationSeconds}s</p>
        </div>
      </div>
      <div className="h-64">
        <Bar data={analyticsChart} options={CHART_OPTIONS} />
      </div>
    </AdminCard>
  );
}

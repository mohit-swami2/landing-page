"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch, API_BASE } from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

type Tab = "dashboard" | "projects" | "about" | "social" | "queries" | "theme" | "hero" | "analytics";
type Notice = { type: "success" | "error"; text: string } | null;

type ProjectRecord = {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  liveLink?: string;
  techStack?: string[];
  visible?: boolean;
  images?: string[];
  imageKeys?: string[];
  createdAt?: string;
};

const emptyProjectForm = () => ({
  name: "",
  slug: "",
  shortDescription: "",
  detailedDescription: "",
  liveLink: "",
  techStack: "",
  visible: true,
  imageFiles: [] as File[],
  existingImageKeys: [] as string[]
});

function projectImageSrc(urlOrPath: string) {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("http")) return urlOrPath;
  return `${API_BASE.replace(/\/api$/, "")}${urlOrPath}`;
}

type SocialRecord = {
  _id: string;
  platformName: string;
  icon: string;
  url: string;
  visible?: boolean;
  createdAt?: string;
};

type QueryRecord = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "seen" | "unseen";
  createdAt?: string;
};

type StatusFilter = "all" | string;

function matchesSearch(query: string, ...fields: (string | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f || "").toLowerCase().includes(q));
}

function AdminListToolbar({
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
    <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="flex-1 p-2.5 rounded-lg bg-slate-900 border border-slate-600 placeholder:text-slate-500 text-sm"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="p-2.5 rounded-lg bg-slate-900 border border-slate-600 text-sm min-w-[140px]"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-400 self-center sm:ml-auto whitespace-nowrap">
        Showing {count} of {total}
      </p>
    </div>
  );
}

const emptySocialForm = () => ({
  platformName: "",
  icon: "github",
  url: "",
  visible: true
});

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

function daysSince(dateStr?: string) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));
}

function isPendingQuery(q: QueryRecord) {
  return q.status !== "seen";
}

function isStalePendingQuery(q: QueryRecord) {
  if (!isPendingQuery(q) || !q.createdAt) return false;
  return Date.now() - new Date(q.createdAt).getTime() >= TWO_DAYS_MS;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#94a3b8", boxWidth: 12, padding: 14 }
    }
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148, 163, 184, 0.12)" }
    },
    y: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148, 163, 184, 0.12)" },
      beginAtZero: true
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: "#94a3b8", boxWidth: 12, padding: 12 }
    }
  }
};

function StatCard({
  label,
  value,
  sub,
  accent = "from-purple-600/20 to-cyan-500/10"
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={`p-4 rounded-xl border border-slate-700 bg-gradient-to-br ${accent}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-3xl font-bold text-slate-50 mt-1">{value}</p>
      {sub ? <p className="text-xs text-slate-400 mt-1">{sub}</p> : null}
    </div>
  );
}

const themePresets = [
  { key: "purpleCyan", name: "Purple Cyan", preview: "linear-gradient(135deg,#5b21b6,#0891b2)" },
  { key: "emeraldTeal", name: "Emerald Teal", preview: "linear-gradient(135deg,#059669,#0d9488)" },
  { key: "sunsetOrange", name: "Sunset Orange", preview: "linear-gradient(135deg,#ea580c,#dc2626)" },
  { key: "blueIndigo", name: "Blue Indigo", preview: "linear-gradient(135deg,#2563eb,#4f46e5)" },
  { key: "rosePink", name: "Rose Pink", preview: "linear-gradient(135deg,#e11d48,#db2777)" },
  { key: "amberGold", name: "Amber Gold", preview: "linear-gradient(135deg,#d97706,#f59e0b)" },
  { key: "oceanSky", name: "Ocean Sky", preview: "linear-gradient(135deg,#0284c7,#38bdf8)" },
  { key: "limeMint", name: "Lime Mint", preview: "linear-gradient(135deg,#65a30d,#10b981)" },
  { key: "violetMagenta", name: "Violet Magenta", preview: "linear-gradient(135deg,#7c3aed,#d946ef)" },
  { key: "crimsonCoral", name: "Crimson Coral", preview: "linear-gradient(135deg,#be123c,#fb7185)" },
  { key: "forestAqua", name: "Forest Aqua", preview: "linear-gradient(135deg,#166534,#06b6d4)" },
  { key: "slateNeon", name: "Slate Neon", preview: "linear-gradient(135deg,#1e293b,#22d3ee)" },
  { key: "royalGold", name: "Royal Gold", preview: "linear-gradient(135deg,#4338ca,#eab308)" },
  { key: "midnightCyan", name: "Midnight Cyan", preview: "linear-gradient(135deg,#0f172a,#06b6d4)" },
  { key: "lavaGlow", name: "Lava Glow", preview: "linear-gradient(135deg,#b91c1c,#f97316)" },
  { key: "mintBerry", name: "Mint Berry", preview: "linear-gradient(135deg,#10b981,#ec4899)" },
  { key: "copperTeal", name: "Copper Teal", preview: "linear-gradient(135deg,#b45309,#0d9488)" },
  { key: "neonLime", name: "Neon Lime", preview: "linear-gradient(135deg,#84cc16,#22c55e)" },
  { key: "arcticBlue", name: "Arctic Blue", preview: "linear-gradient(135deg,#0ea5e9,#67e8f9)" },
  { key: "plumWine", name: "Plum Wine", preview: "linear-gradient(135deg,#7e22ce,#be123c)" },
  { key: "peachFuzz", name: "Peach Fuzz", preview: "linear-gradient(135deg,#fb7185,#fb923c)" },
  { key: "cyberPurple", name: "Cyber Purple", preview: "linear-gradient(135deg,#6d28d9,#22d3ee)" },
  { key: "obsidianAmber", name: "Obsidian Amber", preview: "linear-gradient(135deg,#111827,#f59e0b)" },
  { key: "skyLavender", name: "Sky Lavender", preview: "linear-gradient(135deg,#38bdf8,#c084fc)" },
  { key: "rubySun", name: "Ruby Sun", preview: "linear-gradient(135deg,#e11d48,#facc15)" },
  { key: "pineGold", name: "Pine Gold", preview: "linear-gradient(135deg,#166534,#f59e0b)" },
  { key: "indigoMint", name: "Indigo Mint", preview: "linear-gradient(135deg,#4338ca,#34d399)" },
  { key: "aquaRose", name: "Aqua Rose", preview: "linear-gradient(135deg,#06b6d4,#f43f5e)" },
  { key: "steelBlue", name: "Steel Blue", preview: "linear-gradient(135deg,#334155,#3b82f6)" },
  { key: "mangoFire", name: "Mango Fire", preview: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { key: "glacierGreen", name: "Glacier Green", preview: "linear-gradient(135deg,#14b8a6,#86efac)" },
  { key: "cosmicOrange", name: "Cosmic Orange", preview: "linear-gradient(135deg,#7c2d12,#fb923c)" },
  { key: "graphiteAqua", name: "Graphite Aqua", preview: "linear-gradient(135deg,#1f2937,#2dd4bf)" }
] as const;

export default function AdminPage() {
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<StatusFilter>("all");
  const [socialSearch, setSocialSearch] = useState("");
  const [socialStatusFilter, setSocialStatusFilter] = useState<StatusFilter>("all");
  const [querySearch, setQuerySearch] = useState("");
  const [queryStatusFilter, setQueryStatusFilter] = useState<StatusFilter>("all");
  const [themeSearch, setThemeSearch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<Notice>(null);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [socials, setSocials] = useState<SocialRecord[]>([]);
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [about, setAbout] = useState({ title: "About Me", bio: "", profileDetails: "" });
  const [theme, setTheme] = useState<{ themeKey: string }>({ themeKey: "purpleCyan" });
  const [hero, setHero] = useState({
    availabilityText: "Available for new projects",
    headlineLine1: "Backend that scales.",
    headlineLine2: "Frontend that delights.",
    introText:
      "I'm Mohit - a Full Stack Developer specialising in MERN, performance, and clean architecture. I build systems that handle real load without falling over.",
    primaryCtaLabel: "View my work",
    primaryCtaTarget: "projects",
    secondaryCtaLabel: "Let's talk",
    secondaryCtaTarget: "contact",
    resumeUrl: "/resume.pdf",
    statsInput: "100k+|Users served\n5+|Years building\n20+|Projects shipped",
    techMarqueeInput: "Node.js, React, MongoDB, Express, TypeScript, AWS, Docker, PostgreSQL, Next.js, GraphQL"
  });
  const [analytics, setAnalytics] = useState({ uniqueVisitors: 0, averageSessionDurationSeconds: 0 });
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [socialForm, setSocialForm] = useState(emptySocialForm);

  // Shows compact success/error notices in one place.
  const toast = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 2500);
  };

  const logoutForInvalidToken = (message = "Invalid token. Please login again.") => {
    sessionStorage.removeItem("admin-token");
    setToken("");
    toast("error", message);
  };

  const isUnauthorizedError = (err: unknown) => {
    if (err instanceof ApiError) return err.status === 401;
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      return message.includes("invalid token") || message.includes("unauthorized");
    }
    return false;
  };

  const isPending = (key: string) => Boolean(pendingActions[key]);

  /**
   * Runs any admin action with isolated loading state and unified toast/errors.
   */
  const runAction = async (key: string, action: () => Promise<void>, successText: string) => {
    setPendingActions((prev) => ({ ...prev, [key]: true }));
    try {
      await action();
      toast("success", successText);
    } catch (err) {
      if (token && isUnauthorizedError(err)) {
        logoutForInvalidToken(err instanceof Error ? err.message : undefined);
        return;
      }
      toast("error", err instanceof Error ? err.message : "Action failed");
    } finally {
      setPendingActions((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Fetches every admin-managed resource in parallel to keep dashboard in sync.
  const loadAll = async (authToken: string) => {
    const [p, s, q, a, t, h, m] = await Promise.all([
      apiFetch("/projects", {}, authToken),
      apiFetch("/social-links", {}, authToken),
      apiFetch("/queries", {}, authToken),
      apiFetch("/about", {}, authToken),
      apiFetch("/theme", {}, authToken),
      apiFetch("/hero", {}, authToken),
      apiFetch("/analytics/summary", {}, authToken)
    ]);
    setProjects(p);
    setSocials(s);
    setQueries(q);
    setAbout(a);
    setTheme({ themeKey: t.themeKey || "purpleCyan" });
    setHero({
      availabilityText: h.availabilityText || "Available for new projects",
      headlineLine1: h.headlineLine1 || "Backend that scales.",
      headlineLine2: h.headlineLine2 || "Frontend that delights.",
      introText: h.introText || "",
      primaryCtaLabel: h.primaryCtaLabel || "View my work",
      primaryCtaTarget: h.primaryCtaTarget || "projects",
      secondaryCtaLabel: h.secondaryCtaLabel || "Let's talk",
      secondaryCtaTarget: h.secondaryCtaTarget || "contact",
      resumeUrl: h.resumeUrl || "/resume.pdf",
      statsInput: Array.isArray(h.stats) ? h.stats.map((item: any) => `${item.value}|${item.label}`).join("\n") : "",
      techMarqueeInput: Array.isArray(h.techMarquee) ? h.techMarquee.join(", ") : ""
    });
    setAnalytics(m);
  };

  const logout = () => {
    sessionStorage.removeItem("admin-token");
    setToken("");
    setEditingProjectId(null);
    setEditingSocialId(null);
    setExpandedQueryId(null);
    setProjectForm(emptyProjectForm());
    setSocialForm(emptySocialForm());
  };

  const resetSocialForm = () => {
    setEditingSocialId(null);
    setSocialForm(emptySocialForm());
  };

  const startEditSocial = (social: SocialRecord) => {
    setEditingSocialId(social._id);
    setSocialForm({
      platformName: social.platformName,
      icon: social.icon,
      url: social.url,
      visible: social.visible !== false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleProjectVisibility = async (project: ProjectRecord) => {
    const fd = new FormData();
    fd.append("name", project.name);
    fd.append("slug", project.slug);
    fd.append("shortDescription", project.shortDescription);
    fd.append("detailedDescription", project.detailedDescription);
    fd.append("liveLink", project.liveLink || "");
    fd.append("visible", String(project.visible === false));
    (project.techStack || []).forEach((t) => fd.append("techStack", t));
    (project.imageKeys || []).forEach((key) => fd.append("existingImages", key));
    await apiFetch(`/projects/${project._id}`, { method: "PUT", body: fd }, token);
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm());
  };

  const startEditProject = (project: ProjectRecord) => {
    setEditingProjectId(project._id);
    setProjectForm({
      name: project.name,
      slug: project.slug,
      shortDescription: project.shortDescription,
      detailedDescription: project.detailedDescription,
      liveLink: project.liveLink || "",
      techStack: Array.isArray(project.techStack) ? project.techStack.join(", ") : "",
      visible: project.visible !== false,
      imageFiles: [],
      existingImageKeys: Array.isArray(project.imageKeys)
        ? [...project.imageKeys]
        : Array.isArray(project.images)
          ? project.images.filter((img) => !img.startsWith("http"))
          : []
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildProjectFormData = () => {
    const fd = new FormData();
    fd.append("name", projectForm.name);
    fd.append("slug", projectForm.slug);
    fd.append("shortDescription", projectForm.shortDescription);
    fd.append("detailedDescription", projectForm.detailedDescription);
    fd.append("liveLink", projectForm.liveLink);
    fd.append("visible", String(projectForm.visible));
    projectForm.techStack
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((t) => fd.append("techStack", t));
    projectForm.existingImageKeys.forEach((key) => fd.append("existingImages", key));
    projectForm.imageFiles.forEach((f) => fd.append("images", f));
    return fd;
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-token");
    if (saved) setToken(saved);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!token) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    loadAll(token)
      .catch((e) => {
        if (isUnauthorizedError(e)) {
          logoutForInvalidToken(e instanceof Error ? e.message : undefined);
          return;
        }
        toast("error", e instanceof Error ? e.message : "Failed to load admin data");
      })
      .finally(() => setDataLoading(false));
  }, [token]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (projectStatusFilter === "public" && p.visible === false) return false;
      if (projectStatusFilter === "hidden" && p.visible !== false) return false;
      return matchesSearch(projectSearch, p.name, p.slug, p.shortDescription, p.techStack?.join(" "));
    });
  }, [projects, projectSearch, projectStatusFilter]);

  const filteredSocials = useMemo(() => {
    return socials.filter((s) => {
      if (socialStatusFilter === "visible" && s.visible === false) return false;
      if (socialStatusFilter === "hidden" && s.visible !== false) return false;
      return matchesSearch(socialSearch, s.platformName, s.icon, s.url);
    });
  }, [socials, socialSearch, socialStatusFilter]);

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (queryStatusFilter === "seen" && q.status !== "seen") return false;
      if (queryStatusFilter === "unseen" && q.status !== "unseen") return false;
      return matchesSearch(querySearch, q.name, q.email, q.message);
    });
  }, [queries, querySearch, queryStatusFilter]);

  const filteredThemePresets = useMemo(() => {
    return themePresets.filter((preset) => matchesSearch(themeSearch, preset.name, preset.key));
  }, [themeSearch]);

  const unseenQueryCount = useMemo(() => queries.filter((q) => isPendingQuery(q)).length, [queries]);

  const stalePendingQueries = useMemo(
    () =>
      queries
        .filter((q) => isStalePendingQuery(q))
        .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()),
    [queries]
  );

  const recentPendingQueries = useMemo(
    () =>
      queries
        .filter((q) => isPendingQuery(q) && !isStalePendingQuery(q))
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
    [queries]
  );

  const dashboardStats = useMemo(() => {
    const publicProjects = projects.filter((p) => p.visible !== false).length;
    const hiddenProjects = projects.length - publicProjects;
    const seenQueries = queries.filter((q) => q.status === "seen").length;
    const visibleSocials = socials.filter((s) => s.visible !== false).length;
    const activeTheme = themePresets.find((p) => p.key === theme.themeKey);
    return {
      publicProjects,
      hiddenProjects,
      seenQueries,
      visibleSocials,
      activeTheme
    };
  }, [projects, queries, socials, theme.themeKey]);

  const contentOverviewChart = useMemo(
    () => ({
      labels: ["Projects", "Public projects", "Social links", "Visible socials", "Queries", "Unseen queries"],
      datasets: [
        {
          label: "Count",
          data: [
            projects.length,
            dashboardStats.publicProjects,
            socials.length,
            dashboardStats.visibleSocials,
            queries.length,
            unseenQueryCount
          ],
          backgroundColor: [
            "rgba(147, 51, 234, 0.75)",
            "rgba(6, 182, 212, 0.75)",
            "rgba(168, 85, 247, 0.75)",
            "rgba(52, 211, 153, 0.75)",
            "rgba(251, 146, 60, 0.75)",
            "rgba(244, 63, 94, 0.75)"
          ],
          borderRadius: 8
        }
      ]
    }),
    [projects.length, socials.length, queries.length, unseenQueryCount, dashboardStats]
  );

  const projectStatusChart = useMemo(
    () => ({
      labels: ["Public", "Hidden"],
      datasets: [
        {
          data: [dashboardStats.publicProjects, dashboardStats.hiddenProjects],
          backgroundColor: ["rgba(52, 211, 153, 0.85)", "rgba(100, 116, 139, 0.85)"],
          borderWidth: 0
        }
      ]
    }),
    [dashboardStats]
  );

  const queryStatusChart = useMemo(
    () => ({
      labels: ["Seen", "Pending"],
      datasets: [
        {
          data: [dashboardStats.seenQueries, unseenQueryCount],
          backgroundColor: ["rgba(52, 211, 153, 0.85)", "rgba(251, 191, 36, 0.9)"],
          borderWidth: 0
        }
      ]
    }),
    [dashboardStats.seenQueries, unseenQueryCount]
  );

  const queriesTrendChart = useMemo(() => {
    const days = 7;
    const labels: string[] = [];
    const counts = new Array(days).fill(0);
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString(undefined, { weekday: "short" }));
    }
    queries.forEach((q) => {
      if (!q.createdAt) return;
      const created = new Date(q.createdAt);
      const diffDays = Math.floor((now.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays >= 0 && diffDays < days) {
        counts[days - 1 - diffDays] += 1;
      }
    });
    return {
      labels,
      datasets: [
        {
          label: "New queries",
          data: counts,
          borderColor: "rgb(251, 146, 60)",
          backgroundColor: "rgba(251, 146, 60, 0.15)",
          fill: true,
          tension: 0.35
        }
      ]
    };
  }, [queries]);

  const analyticsChart = useMemo(
    () => ({
      labels: ["Unique visitors", "Avg session (sec)"],
      datasets: [
        {
          label: "Site analytics",
          data: [analytics.uniqueVisitors, analytics.averageSessionDurationSeconds],
          backgroundColor: ["rgba(147, 51, 234, 0.7)", "rgba(6, 182, 212, 0.7)"],
          borderRadius: 8
        }
      ]
    }),
    [analytics]
  );

  if (!authReady) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Loading admin...</p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runAction("login", async () => {
              const data = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
              });
              sessionStorage.setItem("admin-token", data.token);
              setToken(data.token);
            }, "Login successful");
          }}
          className="w-full max-w-md p-6 bg-slate-900/60 rounded-2xl border border-slate-700 space-y-4"
        >
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-slate-400">Sign in to manage portfolio content</p>
          <input
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 placeholder:text-slate-500"
            placeholder="admin@example.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 placeholder:text-slate-500"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            style={{ cursor: "pointer" }}
            disabled={isPending("login")}
            className="w-full p-3 rounded bg-gradient-to-r from-purple-600 to-cyan-500 transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending("login") ? "Please wait..." : "Login"}
          </button>
          {notice ? <p className={`text-sm ${notice.type === "error" ? "text-red-300" : "text-emerald-300"}`}>{notice.text}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 h-fit sticky top-4">
          <h1 className="text-xl font-bold mb-4">Admin</h1>
          <div className="space-y-2">
            {(["dashboard", "projects", "about", "social", "queries", "theme", "hero", "analytics"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-full text-left px-3 py-2 rounded capitalize transition flex items-center justify-between gap-2 ${
                  tab === t ? "bg-purple-600 text-white" : "bg-slate-800 hover:bg-slate-700 hover:text-purple-200"
                }`}
              >
                <span>{t}</span>
                {t === "dashboard" && stalePendingQueries.length > 0 ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-semibold min-w-[1.25rem] text-center">
                    {stalePendingQueries.length}
                  </span>
                ) : null}
                {t === "queries" && unseenQueryCount > 0 ? (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/90 text-slate-900 font-semibold min-w-[1.25rem] text-center">
                    {unseenQueryCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full px-3 py-2 rounded bg-slate-800 border border-slate-600 transition hover:bg-slate-700"
          >
            Logout
          </button>
        </aside>

        <section className="space-y-4 relative">
          {dataLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-950/50 backdrop-blur-[1px]">
              <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : null}
          {notice ? <div className={`rounded-lg px-4 py-3 text-sm ${notice.type === "success" ? "bg-emerald-900/60 text-emerald-200 border border-emerald-700" : "bg-red-900/60 text-red-200 border border-red-700"}`}>{notice.text}</div> : null}

          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-50">Dashboard</h2>
                  <p className="text-sm text-slate-400 mt-1">Portfolio overview, analytics, and action items</p>
                </div>
                <p className="text-xs text-slate-500">{new Date().toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Projects" value={projects.length} sub={`${dashboardStats.publicProjects} public`} />
                <StatCard label="Queries" value={queries.length} sub={`${unseenQueryCount} pending`} accent="from-amber-600/20 to-orange-500/10" />
                <StatCard label="Social links" value={socials.length} sub={`${dashboardStats.visibleSocials} visible`} accent="from-cyan-600/20 to-blue-500/10" />
                <StatCard label="Visitors" value={analytics.uniqueVisitors} sub="unique sessions" accent="from-violet-600/20 to-purple-500/10" />
                <StatCard label="Avg session" value={`${analytics.averageSessionDurationSeconds}s`} sub="site engagement" accent="from-indigo-600/20 to-slate-500/10" />
                <StatCard label="Stale pending" value={stalePendingQueries.length} sub="2+ days unread" accent="from-rose-600/25 to-red-500/10" />
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                <section className="lg:col-span-2 p-5 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 to-slate-900/80 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-amber-100 flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        Notifications
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Pending queries older than 2 days need your attention</p>
                    </div>
                    {stalePendingQueries.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setTab("queries")}
                        className="text-xs px-3 py-1.5 rounded-lg border border-amber-500/50 text-amber-200 hover:bg-amber-500/10"
                      >
                        View all queries
                      </button>
                    ) : null}
                  </div>
                  {stalePendingQueries.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-600 rounded-lg">
                      No stale pending queries. You are all caught up.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {stalePendingQueries.map((q) => (
                        <div
                          key={q._id}
                          className="p-3 rounded-lg border border-amber-500/25 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={isPending(`query.status.${q._id}`)}
                              onClick={() =>
                                runAction(`query.status.${q._id}`, async () => {
                                  await apiFetch(`/queries/${q._id}/status`, {
                                    method: "PATCH",
                                    body: JSON.stringify({ status: "seen" })
                                  }, token);
                                  await loadAll(token);
                                }, "Marked as read")
                              }
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white disabled:opacity-50"
                            >
                              Mark read
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {recentPendingQueries.length > 0 ? (
                    <div className="pt-3 border-t border-slate-700/80">
                      <p className="text-xs text-slate-500 mb-2">Recent pending (under 2 days) — {recentPendingQueries.length}</p>
                      <div className="flex flex-wrap gap-2">
                        {recentPendingQueries.slice(0, 4).map((q) => (
                          <span key={q._id} className="text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300">
                            {q.name}
                          </span>
                        ))}
                        {recentPendingQueries.length > 4 ? (
                          <span className="text-xs text-slate-500">+{recentPendingQueries.length - 4} more</span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="p-5 rounded-xl border border-slate-700 bg-slate-900/60 space-y-3">
                  <h3 className="font-semibold text-slate-200">Current theme</h3>
                  <div
                    className="h-24 rounded-xl border border-slate-600"
                    style={{ background: dashboardStats.activeTheme?.preview || "linear-gradient(135deg,#5b21b6,#0891b2)" }}
                  />
                  <p className="text-lg font-medium text-purple-200">{dashboardStats.activeTheme?.name || theme.themeKey}</p>
                  <p className="text-xs text-slate-500 font-mono">{theme.themeKey}</p>
                  <button
                    type="button"
                    onClick={() => setTab("theme")}
                    className="text-sm w-full py-2 rounded-lg border border-purple-500/40 text-purple-200 hover:bg-purple-500/10"
                  >
                    Change theme
                  </button>
                </section>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
                  <h3 className="font-semibold text-slate-200 mb-3 text-sm">Content overview</h3>
                  <div className="h-56">
                    <Bar data={contentOverviewChart} options={chartOptions} />
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
                  <h3 className="font-semibold text-slate-200 mb-3 text-sm">Site analytics</h3>
                  <div className="h-56">
                    <Bar data={analyticsChart} options={chartOptions} />
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
                  <h3 className="font-semibold text-slate-200 mb-3 text-sm">Project visibility</h3>
                  <div className="h-52">
                    <Doughnut data={projectStatusChart} options={doughnutOptions} />
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
                  <h3 className="font-semibold text-slate-200 mb-3 text-sm">Query status</h3>
                  <div className="h-52">
                    <Doughnut data={queryStatusChart} options={doughnutOptions} />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
                <h3 className="font-semibold text-slate-200 mb-3">Queries — last 7 days</h3>
                <div className="h-52">
                  <Line data={queriesTrendChart} options={chartOptions} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "About", detail: about.bio ? "Content ready" : "Needs content", tab: "about" as Tab },
                  { label: "Hero", detail: hero.headlineLine1 ? "Content ready" : "Needs content", tab: "hero" as Tab },
                  { label: "Projects", detail: `${projects.length} project${projects.length === 1 ? "" : "s"}`, tab: "projects" as Tab },
                  { label: "Social", detail: `${socials.length} link${socials.length === 1 ? "" : "s"}`, tab: "social" as Tab }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setTab(item.tab)}
                    className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-purple-500/40 text-left transition"
                  >
                    <p className="text-xs text-slate-400">{item.label} section</p>
                    <p className="text-lg font-semibold text-slate-100 mt-1">{item.detail}</p>
                    <p className="text-xs text-purple-300 mt-2">Manage →</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "projects" && (
            <div className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const actionKey = editingProjectId ? `project.update.${editingProjectId}` : "project.create";
                  runAction(actionKey, async () => {
                    const fd = buildProjectFormData();
                    if (editingProjectId) {
                      await apiFetch(`/projects/${editingProjectId}`, { method: "PUT", body: fd }, token);
                    } else {
                      await apiFetch("/projects", { method: "POST", body: fd }, token);
                    }
                    resetProjectForm();
                    await loadAll(token);
                  }, editingProjectId ? "Project updated" : "Project created");
                }}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-lg">{editingProjectId ? "Edit Project" : "Create Project"}</h2>
                  {editingProjectId ? (
                    <button
                      type="button"
                      onClick={resetProjectForm}
                      className="text-sm px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      Cancel edit
                    </button>
                  ) : null}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                    placeholder="Project name (e.g. Birlingo)"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                  <input
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                    placeholder="URL slug (e.g. birlingo-edtech)"
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                  />
                </div>
                <input
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                  placeholder="Short description shown on project card"
                  value={projectForm.shortDescription}
                  onChange={(e) => setProjectForm({ ...projectForm, shortDescription: e.target.value })}
                />
                <input
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                  placeholder="Live demo URL (https://...)"
                  value={projectForm.liveLink}
                  onChange={(e) => setProjectForm({ ...projectForm, liveLink: e.target.value })}
                />
                <input
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                  placeholder="Tech stack — Node.js, React, MongoDB"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                />
                <textarea
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                  rows={6}
                  placeholder="Full project description (HTML supported)"
                  value={projectForm.detailedDescription}
                  onChange={(e) => setProjectForm({ ...projectForm, detailedDescription: e.target.value })}
                />
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.visible}
                    onChange={(e) => setProjectForm({ ...projectForm, visible: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  Visible on public portfolio
                </label>
                {projectForm.existingImageKeys.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Current images</p>
                    <div className="flex flex-wrap gap-2">
                      {projectForm.existingImageKeys.map((key) => {
                        const editProject = projects.find((p) => p._id === editingProjectId);
                        const keyIndex = editProject?.imageKeys?.indexOf(key) ?? -1;
                        const preview =
                          keyIndex >= 0 && editProject?.images?.[keyIndex]
                            ? editProject.images[keyIndex]
                            : "";
                        const src = preview ? projectImageSrc(preview) : "";
                        return (
                          <div key={key} className="relative group">
                            <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
                            <button
                              type="button"
                              onClick={() =>
                                setProjectForm({
                                  ...projectForm,
                                  existingImageKeys: projectForm.existingImageKeys.filter((k) => k !== key)
                                })
                              }
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-xs leading-none opacity-0 group-hover:opacity-100"
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setProjectForm({ ...projectForm, imageFiles: Array.from(e.target.files || []) })}
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white file:text-sm"
                />
                {projectForm.imageFiles.length > 0 ? (
                  <p className="text-xs text-slate-400">{projectForm.imageFiles.length} new file(s) selected</p>
                ) : null}
                <button
                  disabled={isPending(editingProjectId ? `project.update.${editingProjectId}` : "project.create")}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 font-medium transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending(editingProjectId ? `project.update.${editingProjectId}` : "project.create")
                    ? "Saving..."
                    : editingProjectId
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-200">All Projects</h3>
                <AdminListToolbar
                  search={projectSearch}
                  onSearchChange={setProjectSearch}
                  searchPlaceholder="Search by name, slug, or tech..."
                  status={projectStatusFilter}
                  onStatusChange={setProjectStatusFilter}
                  statusOptions={[
                    { value: "all", label: "All statuses" },
                    { value: "public", label: "Public only" },
                    { value: "hidden", label: "Hidden only" }
                  ]}
                  count={filteredProjects.length}
                  total={projects.length}
                />
                {projects.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-xl">
                    No projects yet. Create your first project above.
                  </p>
                ) : filteredProjects.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-xl">
                    No projects match your filters.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                    {filteredProjects.map((p) => (
                      <article
                        key={p._id}
                        className={`rounded-xl border overflow-hidden transition ${
                          editingProjectId === p._id
                            ? "border-purple-500/60 bg-purple-950/20"
                            : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                          <div className="sm:w-36 h-32 sm:h-auto flex-shrink-0 bg-slate-800">
                            {p.images && p.images[0] ? (
                              <img
                                src={projectImageSrc(p.images[0])}
                                alt={p.name}
                                className="w-full h-full object-cover min-h-[8rem]"
                              />
                            ) : (
                              <div className="w-full h-full min-h-[8rem] flex items-center justify-center text-slate-500 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-slate-100">{p.name}</h4>
                                <p className="text-xs text-slate-500 font-mono">/{p.slug}</p>
                              </div>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full border ${
                                  p.visible !== false
                                    ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                    : "border-slate-500/40 text-slate-400 bg-slate-500/10"
                                }`}
                              >
                                {p.visible !== false ? "Public" : "Hidden"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">{p.shortDescription}</p>
                            {Array.isArray(p.techStack) && p.techStack.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {p.techStack.slice(0, 5).map((tech) => (
                                  <span key={tech} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                                    {tech}
                                  </span>
                                ))}
                                {p.techStack.length > 5 ? (
                                  <span className="text-xs text-slate-500">+{p.techStack.length - 5}</span>
                                ) : null}
                              </div>
                            ) : null}
                            <div className="flex flex-wrap gap-2 mt-auto pt-2">
                              <button
                                type="button"
                                disabled={isPending(`project.status.${p._id}`)}
                                onClick={() =>
                                  runAction(
                                    `project.status.${p._id}`,
                                    async () => {
                                      await toggleProjectVisibility(p);
                                      await loadAll(token);
                                    },
                                    p.visible !== false ? "Project hidden" : "Project published"
                                  )
                                }
                                className={`text-sm px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                                  p.visible !== false
                                    ? "border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                                    : "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                                }`}
                              >
                                {isPending(`project.status.${p._id}`)
                                  ? "Updating..."
                                  : p.visible !== false
                                    ? "Hide"
                                    : "Publish"}
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditProject(p)}
                                disabled={isPending(`project.update.${p._id}`)}
                                className="text-sm px-3 py-1.5 rounded-lg border border-purple-500/50 text-purple-200 hover:bg-purple-500/10 disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={isPending(`project.delete.${p._id}`)}
                                onClick={() => {
                                  if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
                                  runAction(
                                    `project.delete.${p._id}`,
                                    async () => {
                                      await apiFetch(`/projects/${p._id}`, { method: "DELETE" }, token);
                                      if (editingProjectId === p._id) resetProjectForm();
                                      await loadAll(token);
                                    },
                                    "Project deleted"
                                  );
                                }}
                                className="text-sm px-3 py-1.5 rounded-lg border border-rose-500/50 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                              >
                                {isPending(`project.delete.${p._id}`) ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "about" && (
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">About Section</h2>
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
                  {[about.title, about.bio, about.profileDetails].filter(Boolean).length}/3 fields filled
                </span>
              </div>
              <input
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                placeholder="Section title (e.g. About Me)"
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
              />
              <textarea
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                rows={4}
                placeholder="Short bio paragraph for the portfolio"
                value={about.bio}
                onChange={(e) => setAbout({ ...about, bio: e.target.value })}
              />
              <textarea
                className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500"
                rows={4}
                placeholder="Additional profile details (optional)"
                value={about.profileDetails}
                onChange={(e) => setAbout({ ...about, profileDetails: e.target.value })}
              />
              <button
                disabled={isPending("about.save")}
                className="px-4 py-2 rounded bg-purple-600 transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() =>
                  runAction("about.save", async () => {
                    await apiFetch("/about", { method: "PUT", body: JSON.stringify(about) }, token);
                    await loadAll(token);
                  }, "About updated")
                }
              >
                {isPending("about.save") ? "Saving..." : "Update About"}
              </button>
            </section>
          )}

          {tab === "social" && (
            <section className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const actionKey = editingSocialId ? `social.update.${editingSocialId}` : "social.create";
                  runAction(actionKey, async () => {
                    const body = JSON.stringify(socialForm);
                    if (editingSocialId) {
                      await apiFetch(`/social-links/${editingSocialId}`, { method: "PUT", body }, token);
                    } else {
                      await apiFetch("/social-links", { method: "POST", body }, token);
                    }
                    resetSocialForm();
                    await loadAll(token);
                  }, editingSocialId ? "Social link updated" : "Social link created");
                }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{editingSocialId ? "Edit Social Link" : "Add Social Link"}</h2>
                  {editingSocialId ? (
                    <button type="button" onClick={resetSocialForm} className="text-sm px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-800">
                      Cancel edit
                    </button>
                  ) : null}
                </div>
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Platform name (e.g. GitHub, LinkedIn)" value={socialForm.platformName} onChange={(e) => setSocialForm({ ...socialForm, platformName: e.target.value })} />
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Icon key: github, linkedin, mail, twitter, phone" value={socialForm.icon} onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })} />
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Full URL (https://github.com/... or mailto:you@email.com)" value={socialForm.url} onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })} />
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={socialForm.visible} onChange={(e) => setSocialForm({ ...socialForm, visible: e.target.checked })} className="rounded border-slate-600" />
                  Visible on public site
                </label>
                <button
                  disabled={isPending(editingSocialId ? `social.update.${editingSocialId}` : "social.create")}
                  className="px-4 py-2 rounded bg-purple-600 transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending(editingSocialId ? `social.update.${editingSocialId}` : "social.create")
                    ? "Saving..."
                    : editingSocialId
                      ? "Update Social"
                      : "Add Social"}
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="font-semibold text-slate-200">All Social Links</h3>
                <AdminListToolbar
                  search={socialSearch}
                  onSearchChange={setSocialSearch}
                  searchPlaceholder="Search platform, icon, or URL..."
                  status={socialStatusFilter}
                  onStatusChange={setSocialStatusFilter}
                  statusOptions={[
                    { value: "all", label: "All statuses" },
                    { value: "visible", label: "Visible only" },
                    { value: "hidden", label: "Hidden only" }
                  ]}
                  count={filteredSocials.length}
                  total={socials.length}
                />
                {socials.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-700 rounded-xl">No social links yet.</p>
                ) : filteredSocials.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center border border-dashed border-slate-700 rounded-xl">No links match your filters.</p>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
                    {filteredSocials.map((s) => (
                      <article
                        key={s._id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          editingSocialId === s._id ? "border-purple-500/60 bg-purple-950/20" : "border-slate-700 bg-slate-900/60"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-100">{s.platformName}</p>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-600">{s.icon}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                s.visible !== false
                                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                  : "border-slate-500/40 text-slate-400"
                              }`}
                            >
                              {s.visible !== false ? "Visible" : "Hidden"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-1">{s.url}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={isPending(`social.toggle.${s._id}`)}
                            onClick={() =>
                              runAction(`social.toggle.${s._id}`, async () => {
                                await apiFetch(`/social-links/${s._id}`, {
                                  method: "PUT",
                                  body: JSON.stringify({
                                    platformName: s.platformName,
                                    icon: s.icon,
                                    url: s.url,
                                    visible: s.visible === false
                                  })
                                }, token);
                                await loadAll(token);
                              }, s.visible !== false ? "Link hidden" : "Link visible")
                            }
                            className="text-sm px-3 py-1.5 rounded-lg border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 disabled:opacity-50"
                          >
                            {isPending(`social.toggle.${s._id}`) ? "..." : s.visible !== false ? "Hide" : "Show"}
                          </button>
                          <button type="button" onClick={() => startEditSocial(s)} className="text-sm px-3 py-1.5 rounded-lg border border-purple-500/50 text-purple-200 hover:bg-purple-500/10">
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isPending(`social.delete.${s._id}`)}
                            onClick={() => {
                              if (!window.confirm(`Delete ${s.platformName}?`)) return;
                              runAction(`social.delete.${s._id}`, async () => {
                                await apiFetch(`/social-links/${s._id}`, { method: "DELETE" }, token);
                                if (editingSocialId === s._id) resetSocialForm();
                                await loadAll(token);
                              }, "Social link deleted");
                            }}
                            className="text-sm px-3 py-1.5 rounded-lg border border-rose-500/50 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === "queries" && (
            <section className="space-y-4">
              <h2 className="font-semibold text-slate-200">Contact Queries</h2>
              <AdminListToolbar
                search={querySearch}
                onSearchChange={setQuerySearch}
                searchPlaceholder="Search name, email, or message..."
                status={queryStatusFilter}
                onStatusChange={setQueryStatusFilter}
                statusOptions={[
                  { value: "all", label: "All statuses" },
                  { value: "unseen", label: "Unseen only" },
                  { value: "seen", label: "Seen only" }
                ]}
                count={filteredQueries.length}
                total={queries.length}
              />
              {queries.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-xl">No contact queries yet.</p>
              ) : filteredQueries.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-xl">No queries match your filters.</p>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                  {filteredQueries.map((q) => (
                    <article
                      key={q._id}
                      className={`p-4 rounded-xl border transition ${
                        expandedQueryId === q._id ? "border-purple-500/50 bg-purple-950/15" : "border-slate-700 bg-slate-900/60 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-100">{q.name}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                q.status === "seen"
                                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                                  : "border-amber-500/40 text-amber-300 bg-amber-500/10"
                              }`}
                            >
                              {q.status === "seen" ? "Seen" : "Unseen"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400">{q.email}</p>
                          {q.createdAt ? (
                            <p className="text-xs text-slate-500 mt-1">{new Date(q.createdAt).toLocaleString()}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setExpandedQueryId(expandedQueryId === q._id ? null : q._id)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            {expandedQueryId === q._id ? "Collapse" : "View"}
                          </button>
                          <button
                            disabled={isPending(`query.status.${q._id}`)}
                            className={`text-sm px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${
                              q.status === "seen"
                                ? "border-slate-500/50 text-slate-300 hover:bg-slate-800"
                                : "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                            }`}
                            onClick={() =>
                              runAction(`query.status.${q._id}`, async () => {
                                await apiFetch(`/queries/${q._id}/status`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ status: q.status === "seen" ? "unseen" : "seen" })
                                }, token);
                                await loadAll(token);
                              }, "Status updated")
                            }
                          >
                            {isPending(`query.status.${q._id}`)
                              ? "Updating..."
                              : q.status === "seen"
                                ? "Mark unread"
                                : "Mark read"}
                          </button>
                          <button
                            disabled={isPending(`query.delete.${q._id}`)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-rose-500/50 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                            onClick={() => {
                              if (!window.confirm(`Delete query from ${q.name}?`)) return;
                              runAction(`query.delete.${q._id}`, async () => {
                                await apiFetch(`/queries/${q._id}`, { method: "DELETE" }, token);
                                if (expandedQueryId === q._id) setExpandedQueryId(null);
                                await loadAll(token);
                              }, "Query deleted");
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm text-slate-300 mt-3 ${expandedQueryId === q._id ? "" : "line-clamp-2"}`}>{q.message}</p>
                      {expandedQueryId === q._id ? (
                        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                          Full message shown above. Use status actions to manage this inquiry.
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "theme" && (
            <section className="flex flex-col max-h-[calc(100vh-5rem)] p-4 rounded-xl bg-slate-900/60 border border-slate-700">
              <h2 className="font-semibold flex-shrink-0 mb-3">Select Built-in Theme</h2>
              <div className="flex-shrink-0 mb-3 space-y-2">
                <input
                  type="search"
                  value={themeSearch}
                  onChange={(e) => setThemeSearch(e.target.value)}
                  placeholder="Filter themes by name..."
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500 text-sm"
                />
                <p className="text-xs text-slate-400">
                  Active: <span className="text-purple-300">{themePresets.find((p) => p.key === theme.themeKey)?.name || theme.themeKey}</span>
                  {" · "}
                  Showing {filteredThemePresets.length} of {themePresets.length}
                </p>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 -mr-1">
                {filteredThemePresets.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No themes match your search.</p>
                ) : (
                <div className="grid md:grid-cols-2 gap-2 pb-1">
                  {filteredThemePresets.map((preset) => (
                    <button
                      key={preset.key}
                      type="button"
                      className={`text-left p-3 rounded border transition ${
                        theme.themeKey === preset.key
                          ? "border-purple-400 bg-slate-700 ring-1 ring-purple-400/50"
                          : "border-slate-700 bg-slate-800 hover:border-purple-400"
                      }`}
                      onClick={() => setTheme({ themeKey: preset.key })}
                    >
                      <p className="text-sm font-medium">{preset.name}</p>
                      <div className="h-8 rounded mt-2" style={{ background: preset.preview }} />
                    </button>
                  ))}
                </div>
                )}
              </div>
              <button
                disabled={isPending("theme.save")}
                className="flex-shrink-0 mt-3 px-4 py-2 rounded bg-purple-600 transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed w-fit"
                onClick={() =>
                  runAction("theme.save", async () => {
                    await apiFetch("/theme", { method: "PUT", body: JSON.stringify(theme) }, token);
                    window.localStorage.setItem("lp_theme_key", theme.themeKey);
                    await loadAll(token);
                  }, "Theme updated")
                }
              >
                {isPending("theme.save") ? "Saving..." : "Save Theme"}
              </button>
            </section>
          )}

          {tab === "hero" && (
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 sticky top-0 bg-slate-900/95 py-2 -mt-2 z-[1]">
                <h2 className="font-semibold">Hero Content</h2>
                <span className="text-xs px-2 py-1 rounded-full border border-purple-500/40 text-purple-300 bg-purple-500/10">
                  Edit &amp; update landing hero
                </span>
              </div>
              <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Availability badge (e.g. Available for new projects)" value={hero.availabilityText} onChange={(e) => setHero({ ...hero, availabilityText: e.target.value })} />
              <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Headline line 1 (e.g. Backend that scales.)" value={hero.headlineLine1} onChange={(e) => setHero({ ...hero, headlineLine1: e.target.value })} />
              <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Headline line 2 — accent line (e.g. Frontend that delights.)" value={hero.headlineLine2} onChange={(e) => setHero({ ...hero, headlineLine2: e.target.value })} />
              <textarea className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" rows={4} placeholder="Intro paragraph under the headline" value={hero.introText} onChange={(e) => setHero({ ...hero, introText: e.target.value })} />
              <div className="grid md:grid-cols-2 gap-3">
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Primary button label (e.g. View my work)" value={hero.primaryCtaLabel} onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })} />
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Primary scroll target section id (e.g. projects)" value={hero.primaryCtaTarget} onChange={(e) => setHero({ ...hero, primaryCtaTarget: e.target.value })} />
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Secondary button label (e.g. Let's talk)" value={hero.secondaryCtaLabel} onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })} />
                <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Secondary scroll target section id (e.g. contact)" value={hero.secondaryCtaTarget} onChange={(e) => setHero({ ...hero, secondaryCtaTarget: e.target.value })} />
              </div>
              <input className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" placeholder="Resume PDF path (e.g. /resume.pdf)" value={hero.resumeUrl} onChange={(e) => setHero({ ...hero, resumeUrl: e.target.value })} />
              <textarea className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" rows={4} placeholder="Stats — one per line: value|label (e.g. 100k+|Users served)" value={hero.statsInput} onChange={(e) => setHero({ ...hero, statsInput: e.target.value })} />
              <textarea className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 placeholder:text-slate-500" rows={3} placeholder="Scrolling tech tags, comma separated (Node.js, React, AWS...)" value={hero.techMarqueeInput} onChange={(e) => setHero({ ...hero, techMarqueeInput: e.target.value })} />
              <button
                disabled={isPending("hero.save")}
                className="px-4 py-2 rounded bg-purple-600 transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() =>
                  runAction("hero.save", async () => {
                    const stats = hero.statsInput
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [value, label] = line.split("|").map((part) => part.trim());
                        return { value: value || "", label: label || "" };
                      });
                    const techMarquee = hero.techMarqueeInput
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean);
                    await apiFetch(
                      "/hero",
                      {
                        method: "PUT",
                        body: JSON.stringify({
                          availabilityText: hero.availabilityText,
                          headlineLine1: hero.headlineLine1,
                          headlineLine2: hero.headlineLine2,
                          introText: hero.introText,
                          primaryCtaLabel: hero.primaryCtaLabel,
                          primaryCtaTarget: hero.primaryCtaTarget,
                          secondaryCtaLabel: hero.secondaryCtaLabel,
                          secondaryCtaTarget: hero.secondaryCtaTarget,
                          resumeUrl: hero.resumeUrl,
                          stats,
                          techMarquee
                        })
                      },
                      token
                    );
                    await loadAll(token);
                  }, "Hero content updated")
                }
              >
                {isPending("hero.save") ? "Saving..." : "Update Hero"}
              </button>
            </section>
          )}

          {tab === "analytics" && (
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Analytics</h2>
                <span className="text-xs text-slate-400">Read-only · live from visitor tracking</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-800 rounded">
                  <p className="text-sm text-slate-300">Unique Visitors</p>
                  <p className="text-3xl font-bold">{analytics.uniqueVisitors}</p>
                </div>
                <div className="p-4 bg-slate-800 rounded">
                  <p className="text-sm text-slate-300">Average Session Duration</p>
                  <p className="text-3xl font-bold">{analytics.averageSessionDurationSeconds}s</p>
                </div>
              </div>
              <div className="h-64">
                <Bar data={analyticsChart} options={chartOptions} />
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

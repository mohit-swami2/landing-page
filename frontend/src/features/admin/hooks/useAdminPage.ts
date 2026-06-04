"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { THEME_PRESETS } from "../constants";
import type { AdminTab, Notice, ProjectRecord, QueryRecord, SocialRecord } from "../types";
import {
  daysSince,
  emptyProjectForm,
  emptySocialForm,
  isPendingQuery,
  isStalePendingQuery,
  matchesSearch
} from "../utils";
import "../charts";

const defaultHero = () => ({
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

export function useAdminPage() {
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all");
  const [socialSearch, setSocialSearch] = useState("");
  const [socialStatusFilter, setSocialStatusFilter] = useState<string>("all");
  const [querySearch, setQuerySearch] = useState("");
  const [queryStatusFilter, setQueryStatusFilter] = useState<string>("all");
  const [themeSearch, setThemeSearch] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<Notice>(null);

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [socials, setSocials] = useState<SocialRecord[]>([]);
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [about, setAbout] = useState({ title: "About Me", bio: "", profileDetails: "" });
  const [theme, setTheme] = useState<{ themeKey: string }>({ themeKey: "purpleCyan" });
  const [hero, setHero] = useState(defaultHero());
  const [analytics, setAnalytics] = useState({ uniqueVisitors: 0, averageSessionDurationSeconds: 0 });
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [socialForm, setSocialForm] = useState(emptySocialForm);

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
      statsInput: Array.isArray(h.stats) ? h.stats.map((item: { value: string; label: string }) => `${item.value}|${item.label}`).join("\n") : "",
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
    return THEME_PRESETS.filter((preset) => matchesSearch(themeSearch, preset.name, preset.key));
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
    const activeTheme = THEME_PRESETS.find((p) => p.key === theme.themeKey);
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
            "rgba(34, 211, 238, 0.75)",
            "rgba(59, 130, 246, 0.75)",
            "rgba(34, 211, 238, 0.55)",
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
          borderColor: "rgb(34, 211, 238)",
          backgroundColor: "rgba(34, 211, 238, 0.15)",
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
          backgroundColor: ["rgba(34, 211, 238, 0.7)", "rgba(59, 130, 246, 0.7)"],
          borderRadius: 8
        }
      ]
    }),
    [analytics]
  );

  return {
    authReady,
    dataLoading,
    token,
    setToken,
    tab,
    setTab,
    editingProjectId,
    setEditingProjectId,
    editingSocialId,
    setEditingSocialId,
    expandedQueryId,
    setExpandedQueryId,
    projectSearch,
    setProjectSearch,
    projectStatusFilter,
    setProjectStatusFilter,
    socialSearch,
    setSocialSearch,
    socialStatusFilter,
    setSocialStatusFilter,
    querySearch,
    setQuerySearch,
    queryStatusFilter,
    setQueryStatusFilter,
    themeSearch,
    setThemeSearch,
    headerSearch,
    setHeaderSearch,
    email,
    setEmail,
    password,
    setPassword,
    notice,
    projects,
    socials,
    queries,
    about,
    setAbout,
    theme,
    setTheme,
    hero,
    setHero,
    analytics,
    projectForm,
    setProjectForm,
    socialForm,
    setSocialForm,
    toast,
    runAction,
    loadAll,
    logout,
    isPending,
    resetSocialForm,
    startEditSocial,
    toggleProjectVisibility,
    resetProjectForm,
    startEditProject,
    buildProjectFormData,
    filteredProjects,
    filteredSocials,
    filteredQueries,
    filteredThemePresets,
    unseenQueryCount,
    stalePendingQueries,
    recentPendingQueries,
    dashboardStats,
    contentOverviewChart,
    projectStatusChart,
    queryStatusChart,
    queriesTrendChart,
    analyticsChart,
    daysSince
  };
}

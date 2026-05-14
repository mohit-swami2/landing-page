"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch, API_BASE } from "@/lib/api";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Tab = "projects" | "about" | "social" | "queries" | "theme" | "hero" | "analytics";
type Notice = { type: "success" | "error"; text: string } | null;

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
  const [token, setToken] = useState("");
  const [tab, setTab] = useState<Tab>("projects");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<Notice>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [socials, setSocials] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
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
  const [projectForm, setProjectForm] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    detailedDescription: "",
    liveLink: "",
    techStack: "",
    imageFiles: [] as File[]
  });
  const [socialForm, setSocialForm] = useState({
    platformName: "",
    icon: "github",
    url: ""
  });

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
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    loadAll(token).catch((e) => {
      if (isUnauthorizedError(e)) {
        logoutForInvalidToken(e instanceof Error ? e.message : undefined);
        return;
      }
      toast("error", e instanceof Error ? e.message : "Failed to load admin data");
    });
  }, [token]);

  const chartData = useMemo(
    () => ({
      labels: ["Visitors", "Avg Session (sec)"],
      datasets: [
        {
          label: "Analytics",
          data: [analytics.uniqueVisitors, analytics.averageSessionDurationSeconds],
          borderColor: "rgb(147, 51, 234)",
          backgroundColor: "rgba(147, 51, 234, 0.3)"
        }
      ]
    }),
    [analytics]
  );

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
          <input className="w-full p-3 rounded bg-slate-800 border border-slate-700" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full p-3 rounded bg-slate-800 border border-slate-700" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
            {(["projects", "about", "social", "queries", "theme", "hero", "analytics"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-full text-left px-3 py-2 rounded capitalize transition ${
                  tab === t ? "bg-purple-600 text-white" : "bg-slate-800 hover:bg-slate-700 hover:text-purple-200"
                }`}
              >
                {t}
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

        <section className="space-y-4">
          {notice ? <div className={`rounded-lg px-4 py-3 text-sm ${notice.type === "success" ? "bg-emerald-900/60 text-emerald-200 border border-emerald-700" : "bg-red-900/60 text-red-200 border border-red-700"}`}>{notice.text}</div> : null}

          {tab === "projects" && (
            <div className="space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runAction("project.create", async () => {
                    const fd = new FormData();
                    fd.append("name", projectForm.name);
                    fd.append("slug", projectForm.slug);
                    fd.append("shortDescription", projectForm.shortDescription);
                    fd.append("detailedDescription", projectForm.detailedDescription);
                    fd.append("liveLink", projectForm.liveLink);
                    projectForm.techStack.split(",").map((v) => v.trim()).filter(Boolean).forEach(t => fd.append("techStack", t));
                    projectForm.imageFiles.forEach(f => fd.append("images", f));

                    await apiFetch("/projects", { method: "POST", body: fd }, token);
                    setProjectForm({ name: "", slug: "", shortDescription: "", detailedDescription: "", liveLink: "", techStack: "", imageFiles: [] });
                    await loadAll(token);
                  }, "Project saved");
                }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3"
              >
                <h2 className="font-semibold">Create Project</h2>
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Name" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Slug" value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Short Description" value={projectForm.shortDescription} onChange={(e) => setProjectForm({ ...projectForm, shortDescription: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Live Link" value={projectForm.liveLink} onChange={(e) => setProjectForm({ ...projectForm, liveLink: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Tech Stack (comma separated)" value={projectForm.techStack} onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })} />
                <textarea className="w-full p-2 rounded bg-slate-800 border border-slate-700" rows={6} placeholder="Detailed Description (HTML supported)" value={projectForm.detailedDescription} onChange={(e) => setProjectForm({ ...projectForm, detailedDescription: e.target.value })} />
                <input type="file" multiple accept="image/*" onChange={(e) => setProjectForm({ ...projectForm, imageFiles: Array.from(e.target.files || []) })} className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-slate-300" />
                <button
                  disabled={isPending("project.create")}
                  className="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-cyan-500 transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending("project.create") ? "Saving..." : "Save Project"}
                </button>
              </form>
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div key={p._id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 flex gap-4 items-start">
                    {p.images && p.images.length > 0 && (
                      <img src={`${API_BASE.replace(/\/api$/, "")}${p.images[0]}`} alt={p.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-slate-300">{p.shortDescription}</p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 ? <p className="text-sm text-slate-400">No projects found yet.</p> : null}
              </div>
            </div>
          )}

          {tab === "about" && (
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
              <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
              <textarea className="w-full p-2 rounded bg-slate-800 border border-slate-700" rows={4} value={about.bio} onChange={(e) => setAbout({ ...about, bio: e.target.value })} />
              <textarea className="w-full p-2 rounded bg-slate-800 border border-slate-700" rows={4} value={about.profileDetails} onChange={(e) => setAbout({ ...about, profileDetails: e.target.value })} />
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
                {isPending("about.save") ? "Saving..." : "Save About"}
              </button>
            </section>
          )}

          {tab === "social" && (
            <section className="space-y-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runAction("social.create", async () => {
                    await apiFetch("/social-links", { method: "POST", body: JSON.stringify({ ...socialForm, visible: true }) }, token);
                    setSocialForm({ platformName: "", icon: "github", url: "" });
                    await loadAll(token);
                  }, "Social link created");
                }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3"
              >
                <h2 className="font-semibold">Add Social Link</h2>
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Platform Name (GitHub, LinkedIn, Mail)" value={socialForm.platformName} onChange={(e) => setSocialForm({ ...socialForm, platformName: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Icon key (github/linkedin/mail/twitter)" value={socialForm.icon} onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="URL (https://... or mailto:...)" value={socialForm.url} onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })} />
                <button
                  disabled={isPending("social.create")}
                  className="px-4 py-2 rounded bg-purple-600 transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending("social.create") ? "Saving..." : "Add Social"}
                </button>
              </form>
              {socials.map((s) => (
                <div key={s._id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-between">
                  <div>
                    <p>{s.platformName}</p>
                    <p className="text-xs text-slate-300">{s.url}</p>
                  </div>
                  <button
                    disabled={isPending(`social.toggle.${s._id}`)}
                    onClick={() =>
                      runAction(`social.toggle.${s._id}`, async () => {
                        await apiFetch(`/social-links/${s._id}`, { method: "PUT", body: JSON.stringify({ ...s, visible: !s.visible }) }, token);
                        await loadAll(token);
                      }, `Social ${s.visible ? "hidden" : "shown"}`)
                    }
                    className="px-3 py-2 rounded bg-slate-800 transition hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending(`social.toggle.${s._id}`) ? "Working..." : s.visible ? "Hide" : "Show"}
                  </button>
                </div>
              ))}
              {socials.length === 0 ? <p className="text-sm text-slate-400">No social links found yet.</p> : null}
            </section>
          )}

          {tab === "queries" && (
            <section className="space-y-3">
              {queries.map((q) => (
                <div key={q._id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 transition hover:border-purple-500/40">
                  <div className="flex justify-between items-start gap-3">
                    <p className="font-medium text-slate-100">
                      {q.name} <span className="text-slate-400">({q.email})</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={isPending(`query.status.${q._id}`)}
                        className={`text-xs px-3 py-1.5 rounded border transition disabled:opacity-60 disabled:cursor-not-allowed ${
                          q.status === "seen"
                            ? "border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10"
                            : "border-amber-500/50 text-amber-300 hover:bg-amber-500/10"
                        }`}
                        onClick={() =>
                          runAction(`query.status.${q._id}`, async () => {
                            await apiFetch(`/queries/${q._id}/status`, { method: "PATCH", body: JSON.stringify({ status: q.status === "seen" ? "unseen" : "seen" }) }, token);
                            await loadAll(token);
                          }, "Query status updated")
                        }
                      >
                        {isPending(`query.status.${q._id}`) ? "Updating..." : q.status === "seen" ? "Seen" : "Unseen"}
                      </button>
                      <button
                        disabled={isPending(`query.delete.${q._id}`)}
                        className="text-xs px-3 py-1.5 rounded border border-rose-500/50 text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() =>
                          runAction(`query.delete.${q._id}`, async () => {
                            await apiFetch(`/queries/${q._id}`, { method: "DELETE" }, token);
                            await loadAll(token);
                          }, "Query deleted")
                        }
                      >
                        {isPending(`query.delete.${q._id}`) ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mt-2">{q.message}</p>
                </div>
              ))}
              {queries.length === 0 ? <p className="text-sm text-slate-400">No contact queries yet.</p> : null}
            </section>
          )}

          {tab === "theme" && (
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
              <h2 className="font-semibold">Select Built-in Theme</h2>
              <div className="grid md:grid-cols-2 gap-2">
                {themePresets.map((preset) => (
                  <button key={preset.key} type="button" className={`text-left p-3 rounded border ${theme.themeKey === preset.key ? "border-purple-400 bg-slate-700" : "border-slate-700 bg-slate-800 hover:border-purple-400"}`} onClick={() => setTheme({ themeKey: preset.key })}>
                    <p className="text-sm font-medium">{preset.name}</p>
                    <div className="h-8 rounded mt-2" style={{ background: preset.preview }} />
                  </button>
                ))}
              </div>
              <button
                disabled={isPending("theme.save")}
                className="px-4 py-2 rounded bg-purple-600 transition hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-3">
              <h2 className="font-semibold">Hero Content</h2>
              <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Availability text" value={hero.availabilityText} onChange={(e) => setHero({ ...hero, availabilityText: e.target.value })} />
              <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Headline line 1" value={hero.headlineLine1} onChange={(e) => setHero({ ...hero, headlineLine1: e.target.value })} />
              <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Headline line 2" value={hero.headlineLine2} onChange={(e) => setHero({ ...hero, headlineLine2: e.target.value })} />
              <textarea className="w-full p-2 rounded bg-slate-800 border border-slate-700" rows={4} placeholder="Intro text" value={hero.introText} onChange={(e) => setHero({ ...hero, introText: e.target.value })} />
              <div className="grid md:grid-cols-2 gap-3">
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Primary CTA label" value={hero.primaryCtaLabel} onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Primary CTA target (id)" value={hero.primaryCtaTarget} onChange={(e) => setHero({ ...hero, primaryCtaTarget: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Secondary CTA label" value={hero.secondaryCtaLabel} onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })} />
                <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Secondary CTA target (id)" value={hero.secondaryCtaTarget} onChange={(e) => setHero({ ...hero, secondaryCtaTarget: e.target.value })} />
              </div>
              <input className="w-full p-2 rounded bg-slate-800 border border-slate-700" placeholder="Resume URL (static for now)" value={hero.resumeUrl} onChange={(e) => setHero({ ...hero, resumeUrl: e.target.value })} />
              <textarea className="w-full p-2 rounded bg-slate-800 border border-slate-700" rows={4} placeholder={"Stats lines: value|label"} value={hero.statsInput} onChange={(e) => setHero({ ...hero, statsInput: e.target.value })} />
              <textarea className="w-full p-2 rounded bg-slate-800 border border-slate-700" rows={3} placeholder="Tech marquee (comma separated)" value={hero.techMarqueeInput} onChange={(e) => setHero({ ...hero, techMarqueeInput: e.target.value })} />
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
                {isPending("hero.save") ? "Saving..." : "Save Hero"}
              </button>
            </section>
          )}

          {tab === "analytics" && (
            <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 space-y-4">
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
              <Line data={chartData} />
            </section>
          )}
        </section>
      </div>
    </main>
  );
}

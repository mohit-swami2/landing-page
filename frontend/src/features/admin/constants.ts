import type { AdminTab } from "./types";

export const THEME_PRESETS = [
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

export const NAV_ITEMS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "projects", label: "Projects", icon: "◫" },
  { id: "about", label: "About", icon: "◎" },
  { id: "social", label: "Social", icon: "◇" },
  { id: "queries", label: "Queries", icon: "✉" },
  { id: "theme", label: "Theme", icon: "◈" },
  { id: "hero", label: "Hero", icon: "★" },
  { id: "analytics", label: "Analytics", icon: "↗" }
];

export const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#94a3b8", boxWidth: 12, padding: 14 } }
  },
  scales: {
    x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(34, 211, 238, 0.08)" } },
    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(34, 211, 238, 0.08)" }, beginAtZero: true }
  }
};

export const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const, labels: { color: "#94a3b8", boxWidth: 12, padding: 12 } }
  }
};

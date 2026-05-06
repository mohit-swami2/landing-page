import { PortfolioPage } from "@/features/portfolio/PortfolioPage";

const VALID_THEMES = new Set(["purpleCyan", "emeraldTeal", "sunsetOrange", "blueIndigo", "rosePink"] as const);
type ThemeKey = "purpleCyan" | "emeraldTeal" | "sunsetOrange" | "blueIndigo" | "rosePink";

async function getInitialThemeKey(): Promise<ThemeKey> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/theme/public`, { cache: "no-store" });
    if (!res.ok) return "purpleCyan";
    const data = await res.json();
    const themeKey = data?.themeKey;
    if (typeof themeKey === "string" && VALID_THEMES.has(themeKey as ThemeKey)) {
      return themeKey as ThemeKey;
    }
    return "purpleCyan";
  } catch {
    return "purpleCyan";
  }
}

export default async function Home() {
  const initialThemeKey = await getInitialThemeKey();
  return <PortfolioPage initialThemeKey={initialThemeKey} />;
}

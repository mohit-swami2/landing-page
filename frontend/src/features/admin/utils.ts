import { API_BASE } from "@/lib/api";
import type { QueryRecord } from "./types";

export const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export function projectImageSrc(urlOrPath: string) {
  if (!urlOrPath) return "";
  if (urlOrPath.startsWith("http")) return urlOrPath;
  return `${API_BASE.replace(/\/api$/, "")}${urlOrPath}`;
}

export function matchesSearch(query: string, ...fields: (string | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f || "").toLowerCase().includes(q));
}

export function daysSince(dateStr?: string) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 60 * 60 * 1000));
}

export function isPendingQuery(q: QueryRecord) {
  return q.status !== "seen";
}

export function isStalePendingQuery(q: QueryRecord) {
  if (!isPendingQuery(q) || !q.createdAt) return false;
  return Date.now() - new Date(q.createdAt).getTime() >= TWO_DAYS_MS;
}

export const emptyProjectForm = () => ({
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

export const emptySocialForm = () => ({
  platformName: "",
  icon: "github",
  url: "",
  visible: true
});

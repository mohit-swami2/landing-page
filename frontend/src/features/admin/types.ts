export type AdminTab = "dashboard" | "projects" | "about" | "social" | "queries" | "theme" | "hero" | "analytics";

export type ToastType = "success" | "error";

export type ToastItem = {
  id: string;
  type: ToastType;
  text: string;
  durationMs?: number;
};

export type StatusFilter = "all" | string;

export type ProjectRecord = {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  liveLink?: string;
  techStack?: string[];
  visible?: boolean;
  featured?: boolean;
  sortOrder?: number;
  images?: string[];
  imageKeys?: string[];
  createdAt?: string;
};

export type SocialRecord = {
  _id: string;
  platformName: string;
  icon: string;
  url: string;
  visible?: boolean;
  createdAt?: string;
};

export type QueryRecord = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "seen" | "unseen";
  createdAt?: string;
};

export type ProjectFormState = {
  name: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  liveLink: string;
  techStack: string;
  visible: boolean;
  imageFiles: File[];
  existingImageKeys: string[];
};

export type SocialFormState = {
  platformName: string;
  icon: string;
  url: string;
  visible: boolean;
};

export type HeroFormState = {
  availabilityText: string;
  headlineLine1: string;
  headlineLine2: string;
  introText: string;
  primaryCtaLabel: string;
  primaryCtaTarget: string;
  secondaryCtaLabel: string;
  secondaryCtaTarget: string;
  resumeUrl: string;
  statsInput: string;
  techMarqueeInput: string;
};

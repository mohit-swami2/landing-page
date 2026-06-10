import mongoose from "mongoose";

const heroStatSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

const heroSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, default: 80, min: 0, max: 100 },
    icon: { type: String, default: "code" },
    category: { type: String, enum: ["main", "side"], default: "main" }
  },
  { _id: false }
);

const heroSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    availabilityText: { type: String, default: "Available for new projects" },
    headlineLine1: { type: String, default: "Backend that scales." },
    headlineLine2: { type: String, default: "Frontend that delights." },
    introText: {
      type: String,
      default:
        "I'm Mohit - a Full Stack Developer specialising in MERN, performance, and clean architecture. I build systems that handle real load without falling over."
    },
    primaryCtaLabel: { type: String, default: "View my work" },
    primaryCtaTarget: { type: String, default: "projects" },
    secondaryCtaLabel: { type: String, default: "Let's talk" },
    secondaryCtaTarget: { type: String, default: "contact" },
    resumeUrl: { type: String, default: "/resume.pdf" },
    stats: {
      type: [heroStatSchema],
      default: [
        { value: "100k+", label: "Users served" },
        { value: "5+", label: "Years building" },
        { value: "20+", label: "Projects shipped" }
      ]
    },
    techMarquee: {
      type: [String],
      default: ["Node.js", "React", "MongoDB", "Express", "TypeScript", "AWS", "Docker", "PostgreSQL", "Next.js", "GraphQL"]
    },
    skills: {
      type: [heroSkillSchema],
      default: [
        { name: "Node.js", level: 95, icon: "server", category: "main" },
        { name: "React", level: 90, icon: "code", category: "main" },
        { name: "MongoDB", level: 88, icon: "database", category: "main" },
        { name: "Express", level: 92, icon: "server", category: "main" },
        { name: "Angular", level: 80, icon: "code", category: "main" },
        { name: "AWS", level: 78, icon: "zap", category: "side" },
        { name: "Cloudflare", level: 75, icon: "zap", category: "side" },
        { name: "Docker", level: 82, icon: "database", category: "side" }
      ]
    }
  },
  { timestamps: true }
);

export const HeroSetting = mongoose.model("HeroSetting", heroSettingSchema);

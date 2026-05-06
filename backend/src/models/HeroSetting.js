import mongoose from "mongoose";

const heroStatSchema = new mongoose.Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true }
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
    }
  },
  { timestamps: true }
);

export const HeroSetting = mongoose.model("HeroSetting", heroSettingSchema);

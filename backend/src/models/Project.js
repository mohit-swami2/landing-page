import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    shortDescription: { type: String, required: true },
    detailedDescription: { type: String, required: true },
    liveLink: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    images: { type: [String], default: [] },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);

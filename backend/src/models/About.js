import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    title: { type: String, default: "About Me" },
    bio: { type: String, default: "" },
    profileDetails: { type: String, default: "" }
  },
  { timestamps: true }
);

export const About = mongoose.model("About", aboutSchema);

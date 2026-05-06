import mongoose from "mongoose";

const socialLinkSchema = new mongoose.Schema(
  {
    platformName: { type: String, required: true },
    icon: { type: String, required: true },
    url: { type: String, required: true },
    visible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const SocialLink = mongoose.model("SocialLink", socialLinkSchema);

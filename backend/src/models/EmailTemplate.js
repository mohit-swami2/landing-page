import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    html: { type: String, required: true }
  },
  { timestamps: true }
);

export const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);

import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["unseen", "seen"], default: "unseen" },
    metadata: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      sessionId: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export const Query = mongoose.model("Query", querySchema);

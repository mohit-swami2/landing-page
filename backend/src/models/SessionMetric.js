import mongoose from "mongoose";

const sessionMetricSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    entryTime: { type: Date, required: true },
    lastActive: { type: Date, required: true },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" }
  },
  { timestamps: true }
);

export const SessionMetric = mongoose.model("SessionMetric", sessionMetricSchema);

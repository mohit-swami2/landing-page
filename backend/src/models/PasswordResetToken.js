import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminUser } from "../models/AdminUser.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { generateToken, hashToken } from "../utils/security.js";
import { sendTemplatedEmail } from "../services/emailService.js";

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "7d"
  });

  return res.json({ token, user: { email: user.email, role: user.role } });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await AdminUser.findOne({ email: email.toLowerCase() });
  if (!user) return res.json({ message: "If email exists, reset instructions were sent." });

  const raw = generateToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await PasswordResetToken.create({ adminId: user._id, tokenHash, expiresAt });

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/reset-password?token=${raw}`;
  await sendTemplatedEmail({
    to: user.email,
    key: "password-reset",
    data: { email: user.email, reset_url: resetUrl }
  });

  return res.json({ message: "If email exists, reset instructions were sent." });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  const tokenHash = hashToken(token);

  const reset = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!reset) return res.status(400).json({ message: "Invalid or expired token" });

  const passwordHash = await bcrypt.hash(password, 10);
  await AdminUser.updateOne({ _id: reset.adminId }, { $set: { passwordHash } });
  reset.usedAt = new Date();
  await reset.save();

  return res.json({ message: "Password reset successful" });
}

export function me(req, res) {
  return res.json({ user: req.user });
}

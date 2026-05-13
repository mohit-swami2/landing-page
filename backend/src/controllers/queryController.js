import { Query } from "../models/Query.js";
import { sendTemplatedEmail } from "../services/emailService.js";

function resolveAdminAlertRecipients() {
  const raw = [process.env.ADMIN_ALERT_EMAIL, process.env.EMAIL_FROM]
    .filter(Boolean)
    .join(",");

  const recipients = Array.from(
    new Set(
      raw
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
    )
  );

  return recipients.join(",") || "mohitswami244@gmail.com";
}

export async function submitQuery(req, res) {
  const item = await Query.create({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    metadata: {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
      sessionId: req.body.sessionId || ""
    }
  });

  try {
    await sendTemplatedEmail({
      to: resolveAdminAlertRecipients(),
      key: "new-query-alert",
      data: {
        name: item.name,
        email: item.email,
        message: item.message,
        created_at: item.createdAt.toISOString()
      }
    });
  } catch (error) {
    // Query creation succeeds even if email provider has a temporary issue.
    console.error("[query] failed to send admin alert email", error);
  }

  return res.status(201).json({ ok: true });
}

export async function listQueries(_req, res) {
  const items = await Query.find().sort({ createdAt: -1 });
  return res.json(items);
}

export async function getQuery(req, res) {
  const item = await Query.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function updateQueryStatus(req, res) {
  const item = await Query.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function deleteQuery(req, res) {
  const item = await Query.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json({ ok: true });
}

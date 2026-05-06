import { SessionMetric } from "../models/SessionMetric.js";

export async function trackSession(req, res) {
  const { sessionId, event } = req.body;
  const now = new Date();

  let session = await SessionMetric.findOne({ sessionId });
  if (!session) {
    session = await SessionMetric.create({
      sessionId,
      entryTime: now,
      lastActive: now,
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip
    });
    return res.json({ ok: true, created: true });
  }

  session.lastActive = now;
  if (event === "start") session.entryTime = now;
  await session.save();
  return res.json({ ok: true });
}

export async function analyticsSummary(_req, res) {
  const sessions = await SessionMetric.find();
  const uniqueVisitors = sessions.length;

  const totalDurationMs = sessions.reduce((acc, s) => acc + (s.lastActive.getTime() - s.entryTime.getTime()), 0);
  const averageSessionDurationSeconds = uniqueVisitors ? Math.round(totalDurationMs / uniqueVisitors / 1000) : 0;

  return res.json({
    uniqueVisitors,
    averageSessionDurationSeconds
  });
}

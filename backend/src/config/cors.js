import cors from "cors";

/** Match browser Origin header to allowed list (handles trailing slashes in env). */
function normalizeOrigin(value) {
  if (!value) return "";
  const trimmed = value.trim().replace(/\/+$/, "");
  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
}

function corsOriginCallback(origin, callback) {
  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((item) => normalizeOrigin(item))
    .filter(Boolean);

  if (!origin) {
    return callback(null, true);
  }

  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) {
    return callback(null, true);
  }

  const allowedSummary = allowedOrigins.length ? allowedOrigins.join(", ") : "(none configured)";
  const message = `CORS origin not allowed. Request Origin header: "${origin}" (normalized: "${normalized}"). Allowed origins from FRONTEND_URL: ${allowedSummary}. Add this origin to FRONTEND_URL (comma-separated) or use a matching dev URL.`;

  console.warn("[cors] blocked request", {
    requestOrigin: origin,
    normalized,
    allowedOrigins
  });

  const err = new Error(message);
  err.statusCode = 403;
  return callback(err);
}

export function createCorsMiddleware() {
  return cors({
    origin: corsOriginCallback,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });
}

import express from "express";
import cors from "cors";
import healthRoute from "../src/routes/health.route.js";
import authRoutes from "../src/routes/auth.routes.js";
import projectRoutes from "../src/routes/project.routes.js";
import aboutRoutes from "../src/routes/about.routes.js";
import socialRoutes from "../src/routes/social.routes.js";
import queryRoutes from "../src/routes/query.routes.js";
import themeRoutes from "../src/routes/theme.routes.js";
import analyticsRoutes from "../src/routes/analytics.routes.js";
import heroRoutes from "../src/routes/hero.routes.js";
import { globalErrorHandler, notFoundHandler } from "../src/middleware/error.js";
import { asyncHandler } from "../src/middleware/asyncHandler.js";
import { ensureAppInitialized } from "../src/config/init.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Landing Page backend is running" });
});

app.use("/api/health", healthRoute);
app.use(
  "/api",
  asyncHandler(async (_req, _res, next) => {
    await ensureAppInitialized();
    next();
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/social-links", socialRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/hero", heroRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default function handler(req, res) {
  return app(req, res);
}

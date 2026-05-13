import express from "express";
import { createCorsMiddleware } from "./config/cors.js";
import healthRoute from "./routes/health.route.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aboutRoutes from "./routes/about.routes.js";
import socialRoutes from "./routes/social.routes.js";
import queryRoutes from "./routes/query.routes.js";
import themeRoutes from "./routes/theme.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { ensureAppInitialized } from "./config/init.js";
import morgan from "morgan";

const app = express();
app.use(morgan("dev"));

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(createCorsMiddleware());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ message: "Landing Page backend is running" });
});

app.use("/api/health", healthRoute);
app.use(
  "/api",
  asyncHandler(async (req, _res, next) => {
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

export default app;

import express from "express";
import { createCorsMiddleware } from "../src/config/cors.js";
import * as healthRouteModule from "../src/routes/health.route.js";
import * as authRoutesModule from "../src/routes/auth.routes.js";
import * as projectRoutesModule from "../src/routes/project.routes.js";
import * as aboutRoutesModule from "../src/routes/about.routes.js";
import * as socialRoutesModule from "../src/routes/social.routes.js";
import * as queryRoutesModule from "../src/routes/query.routes.js";
import * as themeRoutesModule from "../src/routes/theme.routes.js";
import * as analyticsRoutesModule from "../src/routes/analytics.routes.js";
import * as heroRoutesModule from "../src/routes/hero.routes.js";
import * as errorMiddlewareModule from "../src/middleware/error.js";
import * as asyncHandlerModule from "../src/middleware/asyncHandler.js";
import * as initModule from "../src/config/init.js";

const app = express();
const healthRoute = healthRouteModule.default || healthRouteModule.router;
const authRoutes = authRoutesModule.default || authRoutesModule.router;
const projectRoutes = projectRoutesModule.default || projectRoutesModule.router;
const aboutRoutes = aboutRoutesModule.default || aboutRoutesModule.router;
const socialRoutes = socialRoutesModule.default || socialRoutesModule.router;
const queryRoutes = queryRoutesModule.default || queryRoutesModule.router;
const themeRoutes = themeRoutesModule.default || themeRoutesModule.router;
const analyticsRoutes = analyticsRoutesModule.default || analyticsRoutesModule.router;
const heroRoutes = heroRoutesModule.default || heroRoutesModule.router;
const notFoundHandler = errorMiddlewareModule.notFoundHandler || errorMiddlewareModule.default;
const globalErrorHandler = errorMiddlewareModule.globalErrorHandler || errorMiddlewareModule.default;
const asyncHandler = asyncHandlerModule.asyncHandler || asyncHandlerModule.default;
const ensureAppInitialized = initModule.ensureAppInitialized || initModule.default;

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

import express from "express";
import cors from "cors";
import healthRoute from "./routes/health.route.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aboutRoutes from "./routes/about.routes.js";
import socialRoutes from "./routes/social.routes.js";
import queryRoutes from "./routes/query.routes.js";
import themeRoutes from "./routes/theme.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import heroRoutes from "./routes/hero.routes.js";
import path from "path";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "backend/uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Landing Page backend is running" });
});

app.use("/api/health", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/social-links", socialRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/theme", themeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/hero", heroRoutes);

export default app;

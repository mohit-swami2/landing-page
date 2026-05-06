import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "landing-page-backend",
    timestamp: new Date().toISOString()
  });
});

export default router;

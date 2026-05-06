import { Router } from "express";
import { analyticsSummary, trackSession } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { analyticsSchema } from "../validators/contentValidators.js";

const router = Router();

router.post("/public/track", validateBody(analyticsSchema), trackSession);
router.get("/summary", requireAuth, analyticsSummary);

export default router;

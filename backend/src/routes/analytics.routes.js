import { Router } from "express";
import { analyticsSummary, trackSession } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { analyticsSchema } from "../validators/contentValidators.js";

const router = Router();

router.post("/public/track", validateBody(analyticsSchema), asyncHandler(trackSession));
router.get("/summary", requireAuth, asyncHandler(analyticsSummary));

export default router;

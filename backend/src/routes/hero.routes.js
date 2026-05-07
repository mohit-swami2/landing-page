import { Router } from "express";
import { getHero, updateHero } from "../controllers/heroController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { heroSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", asyncHandler(getHero));
router.get("/", requireAuth, asyncHandler(getHero));
router.put("/", requireAuth, validateBody(heroSchema), asyncHandler(updateHero));

export default router;

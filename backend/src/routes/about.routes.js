import { Router } from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { aboutSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", asyncHandler(getAbout));
router.get("/", requireAuth, asyncHandler(getAbout));
router.put("/", requireAuth, validateBody(aboutSchema), asyncHandler(updateAbout));

export default router;

import { Router } from "express";
import { getTheme, updateTheme } from "../controllers/themeController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { themeSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", asyncHandler(getTheme));
router.get("/", requireAuth, asyncHandler(getTheme));
router.put("/", requireAuth, validateBody(themeSchema), asyncHandler(updateTheme));

export default router;

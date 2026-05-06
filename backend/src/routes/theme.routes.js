import { Router } from "express";
import { getTheme, updateTheme } from "../controllers/themeController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { themeSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", getTheme);
router.get("/", requireAuth, getTheme);
router.put("/", requireAuth, validateBody(themeSchema), updateTheme);

export default router;

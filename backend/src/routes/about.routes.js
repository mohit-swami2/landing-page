import { Router } from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { aboutSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", getAbout);
router.get("/", requireAuth, getAbout);
router.put("/", requireAuth, validateBody(aboutSchema), updateAbout);

export default router;

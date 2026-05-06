import { Router } from "express";
import { getHero, updateHero } from "../controllers/heroController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { heroSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", getHero);
router.get("/", requireAuth, getHero);
router.put("/", requireAuth, validateBody(heroSchema), updateHero);

export default router;

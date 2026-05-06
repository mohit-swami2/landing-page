import { Router } from "express";
import { createSocial, deleteSocial, listPublicSocials, listSocials, updateSocial } from "../controllers/socialController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { socialSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", listPublicSocials);
router.get("/", requireAuth, listSocials);
router.post("/", requireAuth, validateBody(socialSchema), createSocial);
router.put("/:id", requireAuth, validateBody(socialSchema), updateSocial);
router.delete("/:id", requireAuth, deleteSocial);

export default router;

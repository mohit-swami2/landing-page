import { Router } from "express";
import { createSocial, deleteSocial, listPublicSocials, listSocials, updateSocial } from "../controllers/socialController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { socialSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", asyncHandler(listPublicSocials));
router.get("/", requireAuth, asyncHandler(listSocials));
router.post("/", requireAuth, validateBody(socialSchema), asyncHandler(createSocial));
router.put("/:id", requireAuth, validateBody(socialSchema), asyncHandler(updateSocial));
router.delete("/:id", requireAuth, asyncHandler(deleteSocial));

export default router;

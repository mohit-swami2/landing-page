import { Router } from "express";
import { forgotPassword, login, me, resetPassword } from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../validators/authValidators.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/login", validateBody(loginSchema), asyncHandler(login));
router.post("/forgot-password", validateBody(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(resetPassword));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

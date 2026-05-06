import { Router } from "express";
import { forgotPassword, login, me, resetPassword } from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../validators/authValidators.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);
router.get("/me", requireAuth, me);

export default router;

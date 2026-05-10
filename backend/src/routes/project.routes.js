import { Router } from "express";
import { createProject, deleteProject, getProject, listProjects, listPublicProjects, updateProject } from "../controllers/projectController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireExternalStorage, upload } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { projectSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", asyncHandler(listPublicProjects));
router.get("/", requireAuth, asyncHandler(listProjects));
router.get("/:id", requireAuth, asyncHandler(getProject));
router.post("/", requireAuth, upload.array("images", 10), requireExternalStorage, validateBody(projectSchema), asyncHandler(createProject));
router.put("/:id", requireAuth, upload.array("images", 10), requireExternalStorage, validateBody(projectSchema), asyncHandler(updateProject));
router.delete("/:id", requireAuth, asyncHandler(deleteProject));

export default router;

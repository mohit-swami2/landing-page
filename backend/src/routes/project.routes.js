import { Router } from "express";
import { createProject, deleteProject, getProject, listProjects, listPublicProjects, updateProject } from "../controllers/projectController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import { projectSchema } from "../validators/contentValidators.js";

const router = Router();

router.get("/public", listPublicProjects);
router.get("/", requireAuth, listProjects);
router.get("/:id", requireAuth, getProject);
router.post("/", requireAuth, upload.array("images", 10), validateBody(projectSchema), createProject);
router.put("/:id", requireAuth, upload.array("images", 10), validateBody(projectSchema), updateProject);
router.delete("/:id", requireAuth, deleteProject);

export default router;

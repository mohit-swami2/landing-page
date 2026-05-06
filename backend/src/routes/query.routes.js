import { Router } from "express";
import { getQuery, listQueries, submitQuery, updateQueryStatus } from "../controllers/queryController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { querySchema, queryStatusSchema } from "../validators/contentValidators.js";

const router = Router();

router.post("/public", validateBody(querySchema), submitQuery);
router.get("/", requireAuth, listQueries);
router.get("/:id", requireAuth, getQuery);
router.patch("/:id/status", requireAuth, validateBody(queryStatusSchema), updateQueryStatus);

export default router;

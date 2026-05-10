import { Router } from "express";
import { getQuery, listQueries, submitQuery, updateQueryStatus } from "../controllers/queryController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { querySchema, queryStatusSchema } from "../validators/contentValidators.js";

const router = Router();

router.post("/public", validateBody(querySchema), asyncHandler(submitQuery));
router.get("/", requireAuth, asyncHandler(listQueries));
router.get("/:id", requireAuth, asyncHandler(getQuery));
router.patch("/:id/status", requireAuth, validateBody(queryStatusSchema), asyncHandler(updateQueryStatus));

export default router;

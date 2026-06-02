import { Router } from "express";
import {
  createPresignedDownload,
  createPresignedUpload,
  uploadToS3
} from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";
import {
  handleUploadMulterError,
  uploadSingleFile
} from "../middleware/uploadValidation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  uploadSingleFile.single("file"),
  handleUploadMulterError,
  asyncHandler(uploadToS3)
);

router.post("/presigned-upload", requireAuth, asyncHandler(createPresignedUpload));
router.get("/presigned-download", requireAuth, asyncHandler(createPresignedDownload));

export default router;

import multer from "multer";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf"
]);

const storage = multer.memoryStorage();

export const uploadSingleFile = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const error = new Error("Invalid file type. Allowed: jpeg, png, webp, gif, pdf.");
      error.statusCode = 400;
      return cb(error);
    }

    return cb(null, true);
  }
});

export function handleUploadMulterError(err, _req, _res, next) {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    err.statusCode = 400;
    err.message = "File too large. Maximum allowed size is 5MB.";
  }
  next(err);
}

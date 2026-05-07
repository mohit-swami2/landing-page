import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are supported"));
    }
    return cb(null, true);
  }
});

export function requireExternalStorage(req, _res, next) {
  if (!req.files?.length) return next();

  const error = new Error(
    "File uploads require cloud storage. Configure Cloudinary or S3 and upload files from your client or an upload service."
  );
  error.statusCode = 501;
  return next(error);
}

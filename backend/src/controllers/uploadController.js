import {
  assertS3Access,
  generatePresignedDownloadUrl,
  generatePresignedUploadUrl,
  uploadFile
} from "../services/s3Service.js";

export async function uploadToS3(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "File is required in form-data field 'file'." });
  }

  await assertS3Access();
  const result = await uploadFile(req.file);
  const signed = await generatePresignedDownloadUrl({ key: result.key });

  return res.status(201).json({
    key: result.key,
    fileUrl: signed.downloadUrl,
    status: result.status
  });
}

export async function createPresignedUpload(req, res) {
  const { contentType, expiresIn } = req.body || {};
  const result = await generatePresignedUploadUrl({
    contentType,
    expiresIn: Number(expiresIn) || undefined
  });

  return res.status(201).json({
    key: result.key,
    uploadUrl: result.uploadUrl,
    expiresIn: result.expiresIn,
    status: "ready"
  });
}

export async function createPresignedDownload(req, res) {
  const { key } = req.query;
  const { expiresIn } = req.query || {};
  if (!key) {
    return res.status(400).json({ message: "Query parameter 'key' is required." });
  }

  const result = await generatePresignedDownloadUrl({
    key: String(key),
    expiresIn: Number(expiresIn) || undefined
  });

  return res.json({
    key: result.key,
    downloadUrl: result.downloadUrl,
    expiresIn: result.expiresIn
  });
}

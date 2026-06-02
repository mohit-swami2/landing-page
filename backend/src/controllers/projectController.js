import { Project } from "../models/Project.js";
import { generatePresignedDownloadUrl, uploadFile } from "../services/s3Service.js";

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

async function buildImageUrl(imageKeyOrUrl) {
  if (!imageKeyOrUrl) return null;
  if (isHttpUrl(imageKeyOrUrl)) return imageKeyOrUrl;

  const signed = await generatePresignedDownloadUrl({ key: imageKeyOrUrl });
  return signed.downloadUrl;
}

async function serializeProjectForUi(projectDoc) {
  const project = projectDoc.toObject ? projectDoc.toObject() : projectDoc;
  const imageKeys = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
  const images = (await Promise.all(imageKeys.map((item) => buildImageUrl(item)))).filter(Boolean);

  return {
    ...project,
    imageKeys,
    images
  };
}

async function uploadIncomingFiles(files = []) {
  if (!Array.isArray(files) || files.length === 0) return [];
  const uploads = await Promise.all(files.map((file) => uploadFile(file)));
  return uploads.map((item) => item.key);
}

export async function listProjects(_req, res) {
  const data = await Project.find().sort({ createdAt: -1 });
  const serialized = await Promise.all(data.map((project) => serializeProjectForUi(project)));
  return res.json(serialized);
}

export async function listPublicProjects(_req, res) {
  const data = await Project.find({ visible: true }).sort({ createdAt: -1 });
  const serialized = await Promise.all(data.map((project) => serializeProjectForUi(project)));
  return res.json(serialized);
}

export async function getProject(req, res) {
  const item = await Project.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(await serializeProjectForUi(item));
}

export async function createProject(req, res) {
  const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];
  const uploadedKeys = await uploadIncomingFiles(req.files);
  const item = await Project.create({
    ...req.body,
    images: [...existingImages, ...uploadedKeys]
  });
  return res.status(201).json(await serializeProjectForUi(item));
}

export async function updateProject(req, res) {
  const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];
  const uploadedKeys = await uploadIncomingFiles(req.files);
  const item = await Project.findByIdAndUpdate(
    req.params.id,
    { ...req.body, images: [...existingImages, ...uploadedKeys] },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(await serializeProjectForUi(item));
}

export async function deleteProject(req, res) {
  await Project.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
}

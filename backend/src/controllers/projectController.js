import { Project } from "../models/Project.js";

export async function listProjects(_req, res) {
  const data = await Project.find().sort({ createdAt: -1 });
  return res.json(data);
}

export async function listPublicProjects(_req, res) {
  const data = await Project.find({ visible: true }).sort({ createdAt: -1 });
  return res.json(data);
}

export async function getProject(req, res) {
  const item = await Project.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function createProject(req, res) {
  const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];
  const item = await Project.create({ ...req.body, images: existingImages });
  return res.status(201).json(item);
}

export async function updateProject(req, res) {
  const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];
  const item = await Project.findByIdAndUpdate(req.params.id, { ...req.body, images: existingImages }, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function deleteProject(req, res) {
  await Project.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
}

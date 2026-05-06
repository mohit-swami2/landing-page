import { SocialLink } from "../models/SocialLink.js";

export async function listSocials(_req, res) {
  const items = await SocialLink.find().sort({ createdAt: -1 });
  return res.json(items);
}

export async function listPublicSocials(_req, res) {
  const items = await SocialLink.find({ visible: true }).sort({ createdAt: -1 });
  return res.json(items);
}

export async function createSocial(req, res) {
  const item = await SocialLink.create(req.body);
  return res.status(201).json(item);
}

export async function updateSocial(req, res) {
  const item = await SocialLink.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
}

export async function deleteSocial(req, res) {
  await SocialLink.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
}

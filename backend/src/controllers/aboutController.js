import { About } from "../models/About.js";

export async function getAbout(_req, res) {
  let about = await About.findOne();
  if (!about) about = await About.create({});
  return res.json(about);
}

export async function updateAbout(req, res) {
  let about = await About.findOne();
  if (!about) about = await About.create(req.body);
  else {
    about.set(req.body);
    await about.save();
  }
  return res.json(about);
}

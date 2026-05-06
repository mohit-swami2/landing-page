import { ThemeSetting } from "../models/ThemeSetting.js";

export async function getTheme(_req, res) {
  let theme = await ThemeSetting.findOne({ key: "default" });
  if (!theme) theme = await ThemeSetting.create({ key: "default" });
  return res.json(theme);
}

export async function updateTheme(req, res) {
  const theme = await ThemeSetting.findOneAndUpdate({ key: "default" }, req.body, { new: true, upsert: true });
  return res.json(theme);
}

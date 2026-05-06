import { HeroSetting } from "../models/HeroSetting.js";

export async function getHero(_req, res) {
  let hero = await HeroSetting.findOne({ key: "default" });
  if (!hero) hero = await HeroSetting.create({ key: "default" });
  return res.json(hero);
}

export async function updateHero(req, res) {
  const hero = await HeroSetting.findOneAndUpdate({ key: "default" }, req.body, {
    new: true,
    upsert: true
  });
  return res.json(hero);
}

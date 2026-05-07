import dotenv from "dotenv";
import app from "../src/app.js";

dotenv.config();

export default async function handler(req, res) {
  return app(req, res);
}

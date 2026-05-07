import dotenv from "dotenv";
import app from "../src/app.js";
import { ensureAppInitialized } from "../src/config/init.js";

dotenv.config();

export default async function handler(req, res) {
  try {
    await ensureAppInitialized();
    return app(req, res);
  } catch (error) {
    console.error("[vercel] function invocation failed", {
      message: error.message
    });
    return res.status(500).json({
      message: "Failed to initialize backend"
    });
  }
}

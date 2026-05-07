import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { seedDefaults } from "./seed/seedDefaults.js";

dotenv.config();

const PORT = process.env.PORT || 8081;

// Helper to initialize DB and seed data
let isInitialized = false;
async function init() {
  if (!isInitialized) {
    await connectDatabase();
    if (process.env.NODE_ENV !== "production") {
      await seedDefaults();
    }
    isInitialized = true;
  }
}

// 1. LOCAL DEVELOPMENT: Start server if not running on Vercel
if (process.env.NODE_ENV !== "production") {
  init().then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  }).catch((error) => {
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
}

// 2. VERCEL SERVERLESS: Export a handler function
export default async function handler(req, res) {
  await init();
  return app(req, res);
}

import { connectDatabase } from "./db.js";
import { seedDefaults } from "../seed/seedDefaults.js";

let initPromise = null;

function shouldRunSeed() {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.VERCEL === "1") return false;
  return process.env.RUN_SEED_ON_BOOT === "true";
}

export async function ensureAppInitialized() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await connectDatabase();

    if (shouldRunSeed()) {
      await seedDefaults();
      console.log("[init] default seed completed");
    }
  })().catch((error) => {
    initPromise = null;
    throw error;
  });

  return initPromise;
}

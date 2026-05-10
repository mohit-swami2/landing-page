import dotenv from "dotenv";
import app from "./app.js";
import { ensureAppInitialized } from "./config/init.js";

dotenv.config();

const PORT = process.env.PORT || 8081;

async function startLocalServer() {
  try {
    await ensureAppInitialized();
    app.listen(PORT, () => {
      console.log(`[server] backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[server] failed to start backend", error);
    process.exit(1);
  }
}

if (process.env.VERCEL !== "1") {
  startLocalServer();
}

export default app;

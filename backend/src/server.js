import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { seedDefaults } from "./seed/seedDefaults.js";

dotenv.config();

const PORT = process.env.PORT || 8081;

async function startServer() {
  try {
    await connectDatabase();
    await seedDefaults();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

startServer();

import mongoose from "mongoose";

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/landing-page";

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to connect to MongoDB");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10
      })
      .then((mongooseInstance) => {
        console.log("[db] MongoDB connected");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("[db] MongoDB connection failed", {
          message: error.message
        });
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

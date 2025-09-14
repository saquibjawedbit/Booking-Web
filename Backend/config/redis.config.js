import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config({ path: "./.env" });

// Create a single Redis client instance
const redis = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 15198,
  },
});

redis.on("error", (err) => console.log("Redis Client Error", err));
redis.on("connect", () => console.log("Redis Connected Successfully"));

// Connect to Redis immediately when this module is imported
(async () => {
  try {
    // Check if we're in development mode and Redis is needed
    const isDev = process.env.NODE_ENV === "development";
    if (isDev && process.env.SKIP_REDIS === "true") {
      console.log("Skipping Redis connection in development mode");
      return;
    }

    await redis.connect();
    console.log("Redis client connected");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

// Graceful shutdown handler
process.on("SIGINT", async () => {
  try {
    await redis.quit();
    console.log("Redis connection closed");
  } catch (error) {
    console.error("Error closing Redis connection:", error);
  }
});

export default redis;

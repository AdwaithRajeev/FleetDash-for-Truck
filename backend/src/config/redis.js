
const Redis = require("ioredis");

// Redis is optional when REDIS_URL is not configured.
let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log("Redis disabled: REDIS_URL is not configured.");
    return;
  }

  if (redisClient?.status === "ready" || redisClient?.status === "connecting") {
    return;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy(times) {
        return times <= 3 ? 1000 * times : null;
      },
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully.");
    });

    redisClient.on("error", (error) => {
      console.error("Redis error:", error.message);
    });

    redisClient.on("close", () => {
      console.log("Redis connection closed.");
    });
  }

  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Redis connection failed:", error.message);
  }
};

module.exports = {
  get redisClient() {
    return redisClient;
  },
  connectRedis,
};

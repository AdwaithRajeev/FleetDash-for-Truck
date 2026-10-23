const Redis = require("ioredis");

// ============================================================
// REDIS CLIENT
// ============================================================

const redisClient = new Redis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379",
  {
    lazyConnect: true,
    maxRetriesPerRequest: null,
  }
);

// ============================================================
// REDIS EVENTS
// ============================================================

redisClient.on("connect", () => {
  console.log("Redis Connected Successfully");
});

redisClient.on("ready", () => {
  console.log("Redis Ready");
});

redisClient.on("error", (error) => {
  console.error(
    "Redis Error:",
    error.message
  );
});

redisClient.on("close", () => {
  console.log("Redis Connection Closed");
});

// ============================================================
// CONNECT REDIS
// ============================================================

const connectRedis = async () => {
  try {
    if (
      redisClient.status === "ready" ||
      redisClient.status === "connecting"
    ) {
      return;
    }

    await redisClient.connect();

    console.log(
      "Redis Connected Successfully"
    );
  } catch (error) {
    // ioredis may report this if another connection
    // attempt has already started.
    if (
      !error.message.includes(
        "already connecting"
      ) &&
      !error.message.includes(
        "already connected"
      )
    ) {
      console.error(
        "Redis Connection Failed:",
        error.message
      );
    }
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  redisClient,
  connectRedis,
};
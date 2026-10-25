require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

const connectDB =
  require("./config/database");

const {
  redisClient,
  connectRedis,
} = require("./config/redis");

const Vehicle =
  require("./models/vechicle");

const {
  startVehicleSimulation,
  stopVehicleSimulation,
} =
  require("./services/vehicleSimulator");

const {
  setIO,
} = require("./socket");

const PORT =
  process.env.PORT || 5050;

// ============================================================
// HTTP SERVER
// ============================================================

const server =
  http.createServer(app);

// ============================================================
// SOCKET.IO
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

setIO(io);

// ============================================================
// SOCKET CONNECTION
// ============================================================

io.on(
  "connection",
  async (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    try {
      const vehicles =
        await Vehicle.find().lean();

      socket.emit(
        "vehicles:init",
        vehicles
      );

      console.log(
        `Sent ${vehicles.length} vehicles to socket ${socket.id}`
      );
    } catch (error) {
      console.error(
        "Failed to send initial vehicles:",
        error.message
      );
    }

    socket.on(
      "disconnect",
      () => {
        console.log(
          `Socket disconnected: ${socket.id}`
        );
      }
    );
  }
);

// ============================================================
// BROADCAST ALL VEHICLES
// ============================================================

const broadcastVehicles =
  async () => {
    try {
      const vehicles =
        await Vehicle.find().lean();

      io.emit(
        "vehicles:update",
        vehicles
      );

      console.log(
        `Broadcasted ${vehicles.length} vehicles`
      );
    } catch (error) {
      console.error(
        "Vehicle broadcast failed:",
        error.message
      );
    }
  };

// ============================================================
// REDIS PUB/SUB
// ============================================================


const setupRedisSubscriptions = async () => {
  try {
    await connectRedis();

    // Redis is optional when REDIS_URL is not configured.
    if (!redisClient) {
      console.log(
        "Redis Pub/Sub disabled: REDIS_URL is not configured."
      );
      return;
    }

    const subscriber = redisClient.duplicate();

    subscriber.on("error", (error) => {
      console.error(
        "Redis Subscriber Error:",
        error.message
      );
    });

    await subscriber.subscribe(
      "vehicle:update",
      "vehicles:update",
      "alert:new"
    );

    subscriber.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message);

        if (channel === "vehicle:update") {
          io.emit("vehicle:update", data);
        } else if (channel === "vehicles:update") {
          io.emit("vehicles:update", data);
        } else if (channel === "alert:new") {
          io.emit("alert:new", data);
        }
      } catch (error) {
        console.error(
          "Redis message parsing error:",
          error.message
        );
      }
    });

    console.log("Redis Pub/Sub subscriptions ready");
  } catch (error) {
    console.error(
      "Redis subscription setup failed:",
      error.message
    );
  }
};


// ============================================================
// START SERVER
// ============================================================

const startServer =
  async () => {
    try {
      // ------------------------------------------------------
      // DATABASE
      // ------------------------------------------------------

      await connectDB();

      // ------------------------------------------------------
      // REDIS
      // ------------------------------------------------------

      try {
        await setupRedisSubscriptions();
      } catch (redisError) {
        console.error(
          "Redis startup failed:",
          redisError.message
        );
      }

      // ------------------------------------------------------
      // HTTP SERVER
      // ------------------------------------------------------

      server.listen(
        PORT,
        () => {
          console.log(
            `Server running on port ${PORT}`
          );
        }
      );

      // ------------------------------------------------------
      // VEHICLE SIMULATOR
      // ------------------------------------------------------

      try {
        startVehicleSimulation();

        console.log(
          "Vehicle simulator started."
        );
      } catch (simulationError) {
        console.error(
          "Vehicle simulator startup failed:",
          simulationError.message
        );
      }
    } catch (error) {
      console.error(
        "Server startup failed:",
        error.message
      );

      process.exit(1);
    }
  };

startServer();

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

const shutdown =
  async () => {
    console.log(
      "Shutting down server..."
    );

    // --------------------------------------------------------
    // STOP VEHICLE SIMULATOR
    // --------------------------------------------------------

    try {
      stopVehicleSimulation();
    } catch (error) {
      console.error(
        "Simulator shutdown error:",
        error.message
      );
    }

    // --------------------------------------------------------
    // REDIS
    // --------------------------------------------------------

    try {
if (
  redisClient &&
  (
    redisClient.status === "ready" ||
    redisClient.status === "connecting"
  )
) {
  await redisClient.quit();
}
    } catch (error) {
      console.error(
        "Redis shutdown error:",
        error.message
      );
    }

    // --------------------------------------------------------
    // HTTP SERVER
    // --------------------------------------------------------

    server.close(
      () => {
        console.log(
          "HTTP server closed."
        );

        process.exit(0);
      }
    );
  };

process.on(
  "SIGINT",
  shutdown
);

process.on(
  "SIGTERM",
  shutdown
);

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  server,
  io,
  broadcastVehicles,
};
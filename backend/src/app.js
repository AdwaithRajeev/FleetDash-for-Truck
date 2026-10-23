const express = require("express");
const cors = require("cors");

const coordinateRoutes = require("./routes/coordinateRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

// ─────────────────────────────────────────────────────────────
// COORDINATE ROUTES
// ─────────────────────────────────────────────────────────────

app.use("/api", coordinateRoutes);

// ─────────────────────────────────────────────────────────────
// USER / AUTH ROUTES
// ─────────────────────────────────────────────────────────────

app.use("/api/users", userRoutes);

// ─────────────────────────────────────────────────────────────
// VEHICLE ROUTES
// ─────────────────────────────────────────────────────────────

app.use("/vehicles", vehicleRoutes);

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.status(200).send("FleetDash Backend Running");
});

// ─────────────────────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  console.log(
    "Route not found:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ─────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;
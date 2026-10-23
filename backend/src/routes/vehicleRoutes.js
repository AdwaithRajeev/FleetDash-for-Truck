const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

// ─────────────────────────────────────────────
// GET ALL VEHICLES
// GET /vehicles
// ─────────────────────────────────────────────

router.get(
  "/",
  getVehicles
);

// ─────────────────────────────────────────────
// CREATE VEHICLE
// POST /vehicles
// ─────────────────────────────────────────────

router.post(
  "/",
  createVehicle
);

// ─────────────────────────────────────────────
// GET VEHICLE BY ID
// GET /vehicles/:id
// ─────────────────────────────────────────────

router.get(
  "/:id",
  getVehicleById
);

// ─────────────────────────────────────────────
// UPDATE VEHICLE
// PUT /vehicles/:id
// ─────────────────────────────────────────────

router.put(
  "/:id",
  updateVehicle
);

// ─────────────────────────────────────────────
// DELETE VEHICLE
// DELETE /vehicles/:id
// ─────────────────────────────────────────────

router.delete(
  "/:id",
  auth,
  deleteVehicle
);

module.exports = router;
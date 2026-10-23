const Vehicle = require("../models/vechicle");

const {
  emitVehicleUpdate,
} = require("../socket");

const {
  getRedisPublisher,
} = require("../config/redis");

const {
  saveTelemetry,
} = require("../services/telemetryService");

const {
  createVehicleAlerts,
} = require("../services/alertService");

// ─────────────────────────────────────────────
// GET ALL VEHICLES
// ─────────────────────────────────────────────

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().lean();

    console.log(`Fetched ${vehicles.length} vehicles`);

    return res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
    });
  } catch (error) {
    console.error("getVehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// CREATE VEHICLE
// ─────────────────────────────────────────────

const createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);

    await vehicle.save();

    console.log("Vehicle created:", vehicle.vehicleId);

    // Save initial telemetry
    try {
      await saveTelemetry(vehicle);

      console.log(
        `Telemetry stored for created vehicle: ${vehicle.vehicleId}`
      );
    } catch (telemetryError) {
      console.error(
        "Telemetry storage error:",
        telemetryError.message
      );
    }

    // Socket update
    try {
      await emitVehicleUpdate(vehicle);
    } catch (socketError) {
      console.error(
        "Socket emit error:",
        socketError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("createVehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// GET VEHICLE BY ID
// ─────────────────────────────────────────────

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({
      vehicleId: id,
    }).lean();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("getVehicleById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// UPDATE VEHICLE
// ─────────────────────────────────────────────

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Update MongoDB
    const vehicle = await Vehicle.findOneAndUpdate(
      {
        vehicleId: id,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    console.log(
      "Vehicle updated:",
      vehicle.vehicleId
    );

    // ─────────────────────────────────────────
    // TELEMETRY BUCKET
    // ─────────────────────────────────────────

    try {
      await saveTelemetry(vehicle);

      console.log(
        `Telemetry stored: ${vehicle.vehicleId}`
      );
    } catch (telemetryError) {
      console.error(
        "Telemetry storage error:",
        telemetryError.message
      );
    }

    // ─────────────────────────────────────────
    // GEOFENCE + ALERTS
    // ─────────────────────────────────────────

    try {
      const alerts = createVehicleAlerts(vehicle);

      if (alerts.length > 0) {
        console.log(
          `Generated ${alerts.length} alert(s) for ${vehicle.vehicleId}`
        );

        const redis = getRedisPublisher();

        if (redis && redis.isOpen) {
          for (const alert of alerts) {
            await redis.publish(
              "alert:new",
              JSON.stringify(alert)
            );

            console.log(
              `Alert published: ${alert.title} → ${vehicle.vehicleId}`
            );
          }
        }
      }
    } catch (alertError) {
      console.error(
        "Alert/geofence error:",
        alertError.message
      );
    }

    // ─────────────────────────────────────────
    // SOCKET.IO UPDATE
    // ─────────────────────────────────────────

    try {
      await emitVehicleUpdate(vehicle);
    } catch (socketError) {
      console.error(
        "Socket emit error:",
        socketError.message
      );
    }

    // ─────────────────────────────────────────
    // REDIS VEHICLE UPDATE
    // ─────────────────────────────────────────

    try {
      const redis = getRedisPublisher();

      if (redis && redis.isOpen) {
        await redis.publish(
          "vehicle:update",
          JSON.stringify(vehicle)
        );

        console.log(
          `Redis vehicle:update published: ${vehicle.vehicleId}`
        );
      }
    } catch (redisError) {
      console.error(
        "Redis publish error:",
        redisError.message
      );
    }

    // ─────────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────────

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("updateVehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// DELETE VEHICLE
// ─────────────────────────────────────────────

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle =
      await Vehicle.findOneAndDelete({
        vehicleId: id,
      });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    console.log(
      "Vehicle deleted:",
      vehicle.vehicleId
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error(
      "deleteVehicle error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

module.exports = {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
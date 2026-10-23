let io = null;

// ─────────────────────────────────────────────
// SET SOCKET.IO INSTANCE
// ─────────────────────────────────────────────

const setIO = (socketIO) => {
  io = socketIO;

  console.log("Socket.io instance initialized.");
};

// ─────────────────────────────────────────────
// CREATE VEHICLE ALERT
// ─────────────────────────────────────────────

const createVehicleAlert = (vehicle) => {
  if (!vehicle) {
    return null;
  }

  // INACTIVE VEHICLE
  if (vehicle.status === "Inactive") {
    return {
      id: `alert-${vehicle.vehicleId}-offline-${Date.now()}`,
      severity: "Critical",
      title: "Vehicle Offline",
      description:
        "Vehicle is currently inactive and may require attention.",
      vehicleId: vehicle.vehicleId,
      timestamp: new Date().toISOString(),
    };
  }

  // SPEED ALERT
  if (Number(vehicle.speed) > 110) {
    return {
      id: `alert-${vehicle.vehicleId}-speed-${Date.now()}`,
      severity: "Warning",
      title: "Speed Limit Exceeded",
      description:
        `Vehicle speed is ${vehicle.speed} km/h.`,
      vehicleId: vehicle.vehicleId,
      timestamp: new Date().toISOString(),
    };
  }

  return null;
};

// ─────────────────────────────────────────────
// EMIT VEHICLE UPDATE
// ─────────────────────────────────────────────

const emitVehicleUpdate = (vehicle) => {
  if (!io) {
    console.log(
      "Socket.io is not initialized."
    );

    return;
  }

  // Send vehicle update
  io.emit(
    "vehicle:update",
    vehicle
  );

  console.log(
    `Socket vehicle:update emitted: ${vehicle.vehicleId}`
  );

  // Create alert
  const alert =
    createVehicleAlert(vehicle);

  // Send alert if one exists
  if (alert) {
    io.emit(
      "alert:new",
      alert
    );

    console.log(
      `Socket alert:new emitted: ${alert.title} - ${alert.vehicleId}`
    );
  }
};

// ─────────────────────────────────────────────
// EMIT ALERT DIRECTLY
// ─────────────────────────────────────────────

const emitAlert = (alert) => {
  if (!io) {
    console.log(
      "Socket.io is not initialized."
    );

    return;
  }

  if (!alert) {
    return;
  }

  io.emit(
    "alert:new",
    alert
  );

  console.log(
    `Socket alert:new emitted: ${alert.title} - ${alert.vehicleId}`
  );
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  setIO,
  emitVehicleUpdate,
  emitAlert,
  createVehicleAlert,
};
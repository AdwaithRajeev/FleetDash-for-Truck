// ─────────────────────────────────────────────────────────────
// FLEETDASH ALERT SERVICE
// Centralized vehicle alert generation
// ─────────────────────────────────────────────────────────────

const {
  createGeofenceAlert,
} = require("./geofenceService");

// ─────────────────────────────────────────────────────────────
// CREATE STANDARD VEHICLE ALERT
// ─────────────────────────────────────────────────────────────

const createVehicleAlert = (vehicle) => {
  // Vehicle offline
  if (vehicle.status === "Inactive") {
    return {
      id: `alert-${vehicle.vehicleId}-offline-${Date.now()}`,
      severity: "Critical",
      title: "Vehicle Offline",
      description:
        "Vehicle is currently inactive and may require attention.",
      vehicleId: vehicle.vehicleId,
      timestamp: new Date().toLocaleString(),
    };
  }

  // Vehicle speeding
  if (Number(vehicle.speed) > 110) {
    return {
      id: `alert-${vehicle.vehicleId}-speed-${Date.now()}`,
      severity: "Warning",
      title: "Speed Limit Exceeded",
      description:
        `Vehicle speed is ${vehicle.speed} km/h.`,
      vehicleId: vehicle.vehicleId,
      timestamp: new Date().toLocaleString(),
    };
  }

  return null;
};

// ─────────────────────────────────────────────────────────────
// CREATE ALL ALERTS FOR VEHICLE
// ─────────────────────────────────────────────────────────────

const createVehicleAlerts = (vehicle) => {
  const alerts = [];

  // Standard vehicle alert
  const vehicleAlert =
    createVehicleAlert(vehicle);

  if (vehicleAlert) {
    alerts.push(vehicleAlert);
  }

  // Geofence alert
  const geofenceAlert =
    createGeofenceAlert(vehicle);

  if (geofenceAlert) {
    alerts.push(geofenceAlert);
  }

  return alerts;
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  createVehicleAlert,
  createVehicleAlerts,
};
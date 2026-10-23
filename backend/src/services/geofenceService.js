const turf = require("@turf/turf");

// ─────────────────────────────────────────────────────────────
// GEOFENCE DEFINITION
// ─────────────────────────────────────────────────────────────

const GEOFENCE = {
  id: "geofence-chennai",
  name: "Chennai Operations Zone",

  // Turf coordinates are [longitude, latitude]
  polygon: turf.polygon([
    [
      [79.90, 12.80],
      [80.40, 12.80],
      [80.40, 13.30],
      [79.90, 13.30],
      [79.90, 12.80],
    ],
  ]),
};

// ─────────────────────────────────────────────────────────────
// VEHICLE GEOFENCE STATE
// ─────────────────────────────────────────────────────────────

// Stores the previous inside/outside state for each vehicle.
const vehicleGeofenceState = new Map();

// ─────────────────────────────────────────────────────────────
// CHECK VEHICLE POSITION
// ─────────────────────────────────────────────────────────────

const isVehicleInsideGeofence = (vehicle) => {
  const latitude = Number(vehicle.latitude);
  const longitude = Number(vehicle.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return false;
  }

  const point = turf.point([
    longitude,
    latitude,
  ]);

  return turf.booleanPointInPolygon(
    point,
    GEOFENCE.polygon
  );
};

// ─────────────────────────────────────────────────────────────
// CREATE GEOFENCE ALERT
// ─────────────────────────────────────────────────────────────

const createGeofenceAlert = (vehicle) => {
  const vehicleId = vehicle.vehicleId;

  const inside =
    isVehicleInsideGeofence(vehicle);

  const previousState =
    vehicleGeofenceState.get(vehicleId);

  // ───────────────────────────────────────────────────────────
  // FIRST POSITION
  // ───────────────────────────────────────────────────────────

  if (previousState === undefined) {
    vehicleGeofenceState.set(
      vehicleId,
      inside
    );

    // Do not generate an alert for the initial position.
    return null;
  }

  // ───────────────────────────────────────────────────────────
  // NO STATE CHANGE
  // ───────────────────────────────────────────────────────────

  if (previousState === inside) {
    return null;
  }

  // ───────────────────────────────────────────────────────────
  // UPDATE STATE
  // ───────────────────────────────────────────────────────────

  vehicleGeofenceState.set(
    vehicleId,
    inside
  );

  // ───────────────────────────────────────────────────────────
  // VEHICLE LEFT GEOFENCE
  // ───────────────────────────────────────────────────────────

  if (!inside) {
    return {
      id: `alert-${vehicleId}-geofence-exit-${Date.now()}`,
      severity: "Warning",
      title: "Geofence Violation",
      description:
        `Vehicle ${vehicleId} has left the ${GEOFENCE.name}.`,
      vehicleId,
      timestamp: new Date().toLocaleString(),
    };
  }

  // ───────────────────────────────────────────────────────────
  // VEHICLE RETURNED TO GEOFENCE
  // ───────────────────────────────────────────────────────────

  return {
    id: `alert-${vehicleId}-geofence-entry-${Date.now()}`,
    severity: "Information",
    title: "Geofence Restored",
    description:
      `Vehicle ${vehicleId} has returned to the ${GEOFENCE.name}.`,
    vehicleId,
    timestamp: new Date().toLocaleString(),
  };
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  GEOFENCE,
  isVehicleInsideGeofence,
  createGeofenceAlert,
};
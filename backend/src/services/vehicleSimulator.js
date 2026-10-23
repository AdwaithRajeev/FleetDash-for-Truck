const Vehicle = require("../models/vechicle");

const {
  emitVehicleUpdate,
  emitAlert,
} = require("../socket");

const {
  createVehicleAlerts,
} = require("./alertService");

// ─────────────────────────────────────────────────────────────
// SIMULATOR CONFIGURATION
// ─────────────────────────────────────────────────────────────

const SIMULATION_INTERVAL = 1000;

// Chennai Operations Zone
const MIN_LAT = 12.70;
const MAX_LAT = 13.25;

const MIN_LON = 79.80;
const MAX_LON = 80.40;

// Vehicle movement state
const vehicleDirections = new Map();

let simulationInterval = null;
let simulationRunning = false;

// ─────────────────────────────────────────────────────────────
// RANDOM DIRECTION
// ─────────────────────────────────────────────────────────────

const getRandomDirection = () => {
  return Math.random() * Math.PI * 2;
};

// ─────────────────────────────────────────────────────────────
// INITIALIZE VEHICLE DIRECTION
// ─────────────────────────────────────────────────────────────

const initializeDirection = (vehicleId) => {
  if (!vehicleDirections.has(vehicleId)) {
    vehicleDirections.set(
      vehicleId,
      getRandomDirection()
    );
  }

  return vehicleDirections.get(vehicleId);
};

// ─────────────────────────────────────────────────────────────
// UPDATE VEHICLE POSITION
// ─────────────────────────────────────────────────────────────

const calculateNextPosition = (vehicle) => {
  let direction = initializeDirection(
    vehicle.vehicleId
  );

  const speed =
    Number(vehicle.speed) || 40;

  // Speed is km/h.
  // Convert to km travelled in one second.
  const distanceKm =
    speed / 3600;

  // 1 degree latitude ≈ 111 km
  const latitudeDelta =
    (distanceKm / 111) *
    Math.cos(direction);

  // Longitude distance depends on latitude.
  const longitudeKmPerDegree =
    111 *
    Math.cos(
      (vehicle.latitude * Math.PI) / 180
    );

  const longitudeDelta =
    longitudeKmPerDegree > 0
      ? (distanceKm / longitudeKmPerDegree) *
        Math.sin(direction)
      : 0;

  let latitude =
    Number(vehicle.latitude) +
    latitudeDelta;

  let longitude =
    Number(vehicle.longitude) +
    longitudeDelta;

  // ─────────────────────────────────────────────
  // LATITUDE BOUNDARY
  // ─────────────────────────────────────────────

  if (
    latitude >= MAX_LAT ||
    latitude <= MIN_LAT
  ) {
    direction =
      Math.PI - direction;

    latitude = Math.max(
      MIN_LAT,
      Math.min(MAX_LAT, latitude)
    );
  }

  // ─────────────────────────────────────────────
  // LONGITUDE BOUNDARY
  // ─────────────────────────────────────────────

  if (
    longitude >= MAX_LON ||
    longitude <= MIN_LON
  ) {
    direction =
      -direction;

    longitude = Math.max(
      MIN_LON,
      Math.min(MAX_LON, longitude)
    );
  }

  vehicleDirections.set(
    vehicle.vehicleId,
    direction
  );

  return {
    latitude,
    longitude,
  };
};

// ─────────────────────────────────────────────────────────────
// MOVE ALL ACTIVE VEHICLES
// ─────────────────────────────────────────────────────────────

const moveVehicles = async () => {
  try {
    const vehicles =
      await Vehicle.find({
        status: "Active",
      });

    if (vehicles.length === 0) {
      return;
    }

    for (const vehicle of vehicles) {
      try {
        // Give vehicles without speed
        // a realistic movement speed.
        if (
          !vehicle.speed ||
          Number(vehicle.speed) <= 0
        ) {
          vehicle.speed =
            30 + Math.random() * 30;
        }

        // Calculate next GPS position.
        const nextPosition =
          calculateNextPosition(vehicle);

        vehicle.latitude =
          nextPosition.latitude;

        vehicle.longitude =
          nextPosition.longitude;

        // Save updated vehicle.
        await vehicle.save();

        console.log(
          `Simulator → ${vehicle.vehicleId}: ` +
          `${vehicle.latitude.toFixed(6)}, ` +
          `${vehicle.longitude.toFixed(6)}`
        );

        // ─────────────────────────────────────────
        // TELEMETRY + VEHICLE UPDATE PIPELINE
        // ─────────────────────────────────────────

        await emitVehicleUpdate(vehicle);

        // ─────────────────────────────────────────
        // ALERT PIPELINE
        // ─────────────────────────────────────────

        try {
          const alerts =
            createVehicleAlerts(vehicle);

          if (
            alerts &&
            alerts.length > 0
          ) {
            console.log(
              `Alerts generated → ` +
              `${vehicle.vehicleId}: ` +
              `${alerts.length}`
            );

            for (const alert of alerts) {
              emitAlert(alert);
            }
          }
        } catch (alertError) {
          console.error(
            `Alert generation failed for ` +
            `${vehicle.vehicleId}:`,
            alertError.message
          );
        }

      } catch (vehicleError) {
        console.error(
          `Simulator failed for ` +
          `${vehicle.vehicleId}:`,
          vehicleError.message
        );
      }
    }

  } catch (error) {
    console.error(
      "Vehicle simulation failed:",
      error.message
    );
  }
};

// ─────────────────────────────────────────────────────────────
// START SIMULATOR
// ─────────────────────────────────────────────────────────────

const startVehicleSimulation = () => {
  if (simulationRunning) {
    console.log(
      "Vehicle simulator is already running."
    );

    return;
  }

  simulationRunning = true;

  console.log(
    "🚗 Automatic vehicle simulation started."
  );

  console.log(
    `Simulation interval: ${SIMULATION_INTERVAL}ms`
  );

  simulationInterval =
    setInterval(
      moveVehicles,
      SIMULATION_INTERVAL
    );
};

// ─────────────────────────────────────────────────────────────
// STOP SIMULATOR
// ─────────────────────────────────────────────────────────────

const stopVehicleSimulation = () => {
  if (simulationInterval !== null) {
    clearInterval(
      simulationInterval
    );

    simulationInterval = null;
  }

  simulationRunning = false;

  console.log(
    "Vehicle simulator stopped."
  );
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
  startVehicleSimulation,
  stopVehicleSimulation,
};
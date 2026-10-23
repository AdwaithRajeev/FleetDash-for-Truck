const TelemetryBucket = require("../models/telemetryBucket");

// ─────────────────────────────────────────────────────────────
// BUCKET CONFIGURATION
// ─────────────────────────────────────────────────────────────

// Each bucket stores 5 minutes of telemetry.
const BUCKET_DURATION_MS =
  5 * 60 * 1000;

// ─────────────────────────────────────────────────────────────
// GET BUCKET START TIME
// ─────────────────────────────────────────────────────────────

const getBucketStart = (timestamp) => {
  const time =
    new Date(timestamp).getTime();

  return new Date(
    Math.floor(
      time / BUCKET_DURATION_MS
    ) * BUCKET_DURATION_MS
  );
};

// ─────────────────────────────────────────────────────────────
// SAVE TELEMETRY
// ─────────────────────────────────────────────────────────────

const saveTelemetry = async (vehicle) => {
  try {
    if (!vehicle) {
      throw new Error(
        "Vehicle data is required."
      );
    }

    if (!vehicle.vehicleId) {
      throw new Error(
        "Vehicle ID is required."
      );
    }

    const timestamp =
      vehicle.updatedAt ||
      new Date();

    const bucketStart =
      getBucketStart(timestamp);

    const bucketEnd =
      new Date(
        bucketStart.getTime() +
          BUCKET_DURATION_MS
      );

    const telemetryPoint = {
      timestamp:
        new Date(timestamp),

      latitude:
        Number(vehicle.latitude),

      longitude:
        Number(vehicle.longitude),

      speed:
        Number(vehicle.speed ?? 0),

      status:
        vehicle.status || "Active",
    };

    // ─────────────────────────────────────────────────────────
    // FIND OR CREATE BUCKET
    // ─────────────────────────────────────────────────────────

    const bucket =
      await TelemetryBucket.findOneAndUpdate(
        {
          vehicleId:
            vehicle.vehicleId,

          bucketStart,
        },

        {
          $setOnInsert: {
            vehicleId:
              vehicle.vehicleId,

            bucketStart,

            bucketEnd,
          },

          $push: {
            telemetry:
              telemetryPoint,
          },

          $inc: {
            count: 1,
          },
        },

        {
          upsert: true,
          returnDocument: "after",
        }
      );

    console.log(
      `Telemetry stored: ${vehicle.vehicleId} | bucket ${bucketStart.toISOString()} | count ${bucket.count}`
    );

    return bucket;
  } catch (error) {
    console.error(
      "Telemetry storage failed:",
      error.message
    );

    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {
  saveTelemetry,
  getBucketStart,
};
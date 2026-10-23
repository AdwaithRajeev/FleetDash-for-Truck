const mongoose = require("mongoose");

const telemetryPointSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    speed: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    _id: false,
  }
);

const telemetryBucketSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
    },

    bucketStart: {
      type: Date,
      required: true,
    },

    bucketEnd: {
      type: Date,
      required: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    telemetry: {
      type: [telemetryPointSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

telemetryBucketSchema.index({
  vehicleId: 1,
  bucketStart: 1,
});

module.exports =
  mongoose.model(
    "TelemetryBucket",
    telemetryBucketSchema
  );
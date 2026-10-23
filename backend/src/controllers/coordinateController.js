const processCoordinates = require("../services/workerService");
const { logInfo, logError } = require("../utils/logger");
const Vehicle = require("../models/vechicle");
const { emitVehicleUpdate } = require("../socket");

// ─────────────────────────────────────────────────────────────
// PROCESS SINGLE COORDINATE
// ─────────────────────────────────────────────────────────────

const processCoordinate = async (req, res) => {
    try {
        const startTime = Date.now();

        logInfo("Coordinate processing request received.");

        const result = await processCoordinates(req.body);

        if (result.error) {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        const updatedVehicle = await Vehicle.findOneAndUpdate(
            {
                vehicleId: result.vehicleId
            },
            {
                latitude: result.latitude,
                longitude: result.longitude,
                speed: req.body.speed || 0,
                lastUpdated: new Date()
            },
            {
                returnDocument: "after"
            }
        );

        if (!updatedVehicle) {
            return res.status(404).json({
                success: false,
                message:
                    "Vehicle not found. Please register the vehicle first using POST /vehicles."
            });
        }

        logInfo("Vehicle location updated in MongoDB.");

        await emitVehicleUpdate(updatedVehicle);

        logInfo("Vehicle update emitted through Socket.io.");
        logInfo("Controller Received Coordinate");

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        logInfo(
            `Coordinate processed in ${processingTime} ms`
        );

        return res.status(200).json({
            success: true,
            message: "Coordinate processed successfully.",
            processingTime: `${processingTime} ms`,
            data: updatedVehicle
        });

    } catch (err) {
        logError(err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ─────────────────────────────────────────────────────────────
// VALIDATE BATCH COORDINATES
// ─────────────────────────────────────────────────────────────

const validateBatchCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates)) {
        return {
            valid: false,
            message: "Request body must be an array."
        };
    }

    if (coordinates.length === 0) {
        return {
            valid: false,
            message:
                "Request body must contain at least one coordinate."
        };
    }

    for (let i = 0; i < coordinates.length; i++) {
        const coordinate = coordinates[i];

        if (!coordinate || typeof coordinate !== "object") {
            return {
                valid: false,
                message:
                    `Coordinate at index ${i} must be an object.`
            };
        }

        // VEHICLE ID

        if (
            !coordinate.vehicleId ||
            typeof coordinate.vehicleId !== "string" ||
            coordinate.vehicleId.trim() === ""
        ) {
            return {
                valid: false,
                message:
                    `Coordinate at index ${i} must contain vehicleId.`
            };
        }

        // LATITUDE / LONGITUDE EXISTENCE

        if (
            coordinate.latitude === undefined ||
            coordinate.latitude === null ||
            coordinate.longitude === undefined ||
            coordinate.longitude === null
        ) {
            return {
                valid: false,
                message:
                    `Coordinate at index ${i} must contain latitude and longitude.`
            };
        }

        // NUMBER VALIDATION

        const latitude = Number(coordinate.latitude);
        const longitude = Number(coordinate.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return {
                valid: false,
                message:
                    `Coordinate at index ${i}: latitude and longitude must be numbers.`
            };
        }

        // LATITUDE RANGE

        if (latitude < -90 || latitude > 90) {
            return {
                valid: false,
                message:
                    `Coordinate at index ${i}: latitude must be between -90 and 90.`
            };
        }

        // LONGITUDE RANGE

        if (longitude < -180 || longitude > 180) {
            return {
                valid: false,
                message:
                    `Coordinate at index ${i}: longitude must be between -180 and 180.`
            };
        }

        // SPEED VALIDATION

        if (
            coordinate.speed !== undefined &&
            coordinate.speed !== null
        ) {
            const speed = Number(coordinate.speed);

            if (!Number.isFinite(speed) || speed < 0) {
                return {
                    valid: false,
                    message:
                        `Coordinate at index ${i}: speed must be a non-negative number.`
                };
            }
        }
    }

    return {
        valid: true
    };
};

// ─────────────────────────────────────────────────────────────
// PROCESS MULTIPLE COORDINATES
// ─────────────────────────────────────────────────────────────

const processCoordinatesBatch = async (req, res) => {
    try {
        logInfo(
            "Batch coordinate processing request received."
        );

        const coordinates = req.body;

        // VALIDATE ENTIRE REQUEST

        const validation =
            validateBatchCoordinates(coordinates);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // PROCESS COORDINATES

        const updates = [];

        for (const coordinate of coordinates) {
            const result =
                await processCoordinates(coordinate);

            if (result.error) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            updates.push({
                updateOne: {
                    filter: {
                        vehicleId: result.vehicleId
                    },

                    update: {
                        $set: {
                            latitude: result.latitude,
                            longitude: result.longitude,
                            speed: coordinate.speed || 0,
                            lastUpdated: new Date()
                        }
                    }
                }
            });
        }

        // BULK DATABASE UPDATE

        const dbResult =
            await Vehicle.bulkWrite(updates);

        logInfo("Bulk database update completed.");

        logInfo(
            `Matched Vehicles: ${dbResult.matchedCount}`
        );

        logInfo(
            `Modified Vehicles: ${dbResult.modifiedCount}`
        );

        // GET UPDATED VEHICLES

        const vehicleIds = coordinates.map(
            (coordinate) => coordinate.vehicleId
        );

        const updatedVehicles =
            await Vehicle.find({
                vehicleId: {
                    $in: vehicleIds
                }
            });

        // REDIS → SOCKET.IO

        for (const vehicle of updatedVehicles) {
            await emitVehicleUpdate(vehicle);
        }

        logInfo(
            `Socket.io updates emitted for ${updatedVehicles.length} vehicles.`
        );

        // MISSING VEHICLE INFORMATION

        if (
            dbResult.matchedCount !==
            coordinates.length
        ) {
            logInfo(
                "Some vehicle IDs were not found in the database."
            );
        }

        // RESPONSE

        return res.status(200).json({
            success: true,

            message:
                "Batch processed successfully.",

            totalReceived:
                coordinates.length,

            matched:
                dbResult.matchedCount,

            modified:
                dbResult.modifiedCount
        });

    } catch (err) {
        logError(err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ─────────────────────────────────────────────────────────────
// GET INGESTION STATISTICS
// ─────────────────────────────────────────────────────────────

const getStats = async (req, res) => {
    try {
        const totalVehicles =
            await Vehicle.countDocuments();

        const activeVehicles =
            await Vehicle.countDocuments({
                status: "Active"
            });

        return res.status(200).json({
            success: true,

            totalVehicles,

            activeVehicles,

            serverTime: new Date()
        });

    } catch (err) {
        logError(err.message);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {
    processCoordinate,
    processCoordinatesBatch,
    getStats
};
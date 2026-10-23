const express = require("express");

const router = express.Router();

const {
    processCoordinate,
    processCoordinatesBatch,
    getStats
} = require("../controllers/coordinateController");

const validateCoordinate = require("../middleware/validateCoordinate");

router.get("/health", (req, res) => {
    res.json({
        status: "Running",
        service: "FleetDash Backend"
    });
});

router.post(
    "/process-coordinate",
    validateCoordinate,
    processCoordinate
);

router.post(
    "/process-coordinates",
    processCoordinatesBatch
);

router.get("/stats", getStats);

module.exports = router;
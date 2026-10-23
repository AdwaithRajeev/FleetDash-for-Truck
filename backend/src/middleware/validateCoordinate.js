// ─────────────────────────────────────────────────────────────
// COORDINATE VALIDATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────

function validateCoordinate(
    req,
    res,
    next
) {
    const {
        vehicleId,
        latitude,
        longitude
    } = req.body;

    // ─────────────────────────────────────────────────────────
    // REQUIRED FIELDS
    // ─────────────────────────────────────────────────────────

    if (
        !vehicleId ||
        typeof vehicleId !==
            "string" ||
        vehicleId.trim() === ""
    ) {
        return res.status(400).json({
            success: false,
            message:
                "vehicleId is required."
        });
    }

    if (
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
    ) {
        return res.status(400).json({
            success: false,
            message:
                "latitude and longitude are required."
        });
    }

    // ─────────────────────────────────────────────────────────
    // NUMBER VALIDATION
    // ─────────────────────────────────────────────────────────

    const latitudeNumber =
        Number(latitude);

    const longitudeNumber =
        Number(longitude);

    if (
        !Number.isFinite(
            latitudeNumber
        ) ||
        !Number.isFinite(
            longitudeNumber
        )
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Latitude and Longitude must be numbers."
        });
    }

    // ─────────────────────────────────────────────────────────
    // LATITUDE RANGE
    // ─────────────────────────────────────────────────────────

    if (
        latitudeNumber < -90 ||
        latitudeNumber > 90
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Latitude must be between -90 and 90."
        });
    }

    // ─────────────────────────────────────────────────────────
    // LONGITUDE RANGE
    // ─────────────────────────────────────────────────────────

    if (
        longitudeNumber < -180 ||
        longitudeNumber > 180
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Longitude must be between -180 and 180."
        });
    }

    next();
}

module.exports =
    validateCoordinate;
// ─────────────────────────────────────────────────────────────
// COORDINATE PARSER
// ─────────────────────────────────────────────────────────────

function parseCoordinate(data) {
    if (
        !data ||
        !data.vehicleId
    ) {
        throw new Error(
            "vehicleId is required."
        );
    }

    const latitude =
        Number(
            data.latitude
        );

    const longitude =
        Number(
            data.longitude
        );

    if (
        !Number.isFinite(
            latitude
        ) ||
        !Number.isFinite(
            longitude
        )
    ) {
        throw new Error(
            "Latitude and Longitude must be numbers."
        );
    }

    if (
        latitude < -90 ||
        latitude > 90
    ) {
        throw new Error(
            "Latitude must be between -90 and 90."
        );
    }

    if (
        longitude < -180 ||
        longitude > 180
    ) {
        throw new Error(
            "Longitude must be between -180 and 180."
        );
    }

    return {
        vehicleId:
            data.vehicleId,

        latitude,

        longitude,

        timestamp:
            new Date().toISOString()
    };
}

module.exports =
    parseCoordinate;
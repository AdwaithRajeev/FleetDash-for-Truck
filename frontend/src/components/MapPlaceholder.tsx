// frontend/src/components/MapPlaceholder.tsx

import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Vehicle } from "./VehicleList";

interface MapPlaceholderProps {
  height?: number;
  vehicles?: Vehicle[];
}

const CHENNAI_CENTER: [number, number] = [
  13.0827,
  80.2707,
];

/*
 * Get marker color based on vehicle status.
 *
 * Green  = Moving
 * Red    = Offline
 */
const getVehicleColor = (
  status: Vehicle["status"]
): string => {
  switch (status) {
    case "Moving":
      return "#31D67B";

    case "Offline":
      return "#FF5C5C";

    /*
     * Fallback for any other status.
     * This prevents yellow/gray markers.
     */
    default:
      return "#FF5C5C";
  }
};

/*
 * Create a custom vehicle map marker.
 *
 * The marker looks like a map/navigation pin
 * instead of a simple CircleMarker.
 *
 * The vehicle number is displayed inside it.
 */
const createVehicleIcon = (
  vehicleId: string,
  color: string
): L.DivIcon => {
  return L.divIcon({
    className: "vehicle-map-marker",

    html: `
      <div
        style="
          position: relative;
          width: 56px;
          height: 68px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        "
      >

        <!-- Main map pin -->
        <div
          style="
            position: absolute;
            top: 2px;
            left: 9px;

            width: 38px;
            height: 38px;

            border-radius: 50% 50% 50% 0;

            background: ${color};

            border: 3px solid #ffffff;

            box-shadow:
              0 3px 8px rgba(0,0,0,0.45),
              0 0 10px ${color}88;

            transform: rotate(-45deg);

            display: flex;
            align-items: center;
            justify-content: center;
          "
        >

          <!-- Vehicle number -->
          <div
            style="
              transform: rotate(45deg);

              color: #ffffff;

              font-size: 8px;
              font-weight: 800;

              line-height: 1;

              text-align: center;

              width: 34px;

              overflow: hidden;

              white-space: nowrap;

              text-overflow: ellipsis;

              font-family:
                Arial,
                Helvetica,
                sans-serif;
            "
          >
            ${vehicleId}
          </div>

        </div>

        <!-- Pin tip / shadow -->
        <div
          style="
            position: absolute;

            top: 43px;
            left: 24px;

            width: 0;
            height: 0;

            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 9px solid ${color};
          "
        ></div>

      </div>
    `,

    iconSize: [56, 68],

    /*
     * Bottom center of marker points
     * exactly to the vehicle coordinates.
     */
    iconAnchor: [28, 52],

    /*
     * Popup appears above the marker.
     */
    popupAnchor: [0, -48],
  });
};

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  height = 520,
  vehicles = [],
}) => {
  return (
    <section
      aria-label="Live fleet map"
      style={{
        position: "relative",
        width: "100%",
        height: `${height}px`,
        minHeight: "400px",
        overflow: "hidden",
        borderRadius: "12px",
        background: "#172033",
      }}
    >
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={11}
        scrollWheelZoom={true}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "400px",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {vehicles.map((vehicle) => {
          const latitude = Number(
            vehicle.latitude
          );

          const longitude = Number(
            vehicle.longitude
          );

          /*
           * Ignore invalid coordinates.
           */
          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            return null;
          }

          /*
           * Ignore impossible coordinates.
           */
          if (
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
          ) {
            return null;
          }

          const color = getVehicleColor(
            vehicle.status
          );

          const vehicleId = String(
            vehicle.vehicleId
          );

          return (
            <Marker
              key={vehicleId}
              position={[
                latitude,
                longitude,
              ]}
              icon={createVehicleIcon(
                vehicleId,
                color
              )}
            >
              <Popup>
                <div
                  style={{
                    minWidth: "180px",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  <strong
                    style={{
                      fontSize: "15px",
                    }}
                  >
                    🚛 {vehicle.vehicleId}
                  </strong>

                  <br />

                  <strong>
                    Driver:
                  </strong>{" "}
                  {vehicle.driverName}

                  <br />

                  <strong>
                    Status:
                  </strong>{" "}
                  {vehicle.status}

                  <br />

                  <strong>
                    Speed:
                  </strong>{" "}
                  {vehicle.speedKmh === null
                    ? "N/A"
                    : `${vehicle.speedKmh} km/h`}

                  <br />

                  <strong>
                    Latitude:
                  </strong>{" "}
                  {latitude.toFixed(4)}

                  <br />

                  <strong>
                    Longitude:
                  </strong>{" "}
                  {longitude.toFixed(4)}

                  <br />

                  <strong>
                    Updated:
                  </strong>{" "}
                  {vehicle.lastUpdated}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ─────────────────────────────────────────────
          LIVE VEHICLE COUNT
      ───────────────────────────────────────────── */}

      <div
        aria-label={`Live Vehicles: ${vehicles.length}`}
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 1000,

          padding: "9px 13px",

          borderRadius: "8px",

          background:
            "rgba(10,15,30,0.88)",

          backdropFilter:
            "blur(8px)",

          color: "#ffffff",

          fontSize: "13px",

          fontWeight: 600,

          pointerEvents: "none",
        }}
      >
        🚛 Live Vehicles:{" "}
        {vehicles.length}
      </div>

      {/* ─────────────────────────────────────────────
          LEGEND
          
          Only Moving and Offline.
          Yellow / Idle / Stopped removed.
      ───────────────────────────────────────────── */}

      <div
        style={{
          position: "absolute",

          right: "16px",
          bottom: "16px",

          zIndex: 1000,

          display: "flex",

          gap: "14px",

          alignItems: "center",

          padding: "10px 14px",

          borderRadius: "8px",

          background:
            "rgba(10,15,30,0.9)",

          backdropFilter:
            "blur(8px)",

          color: "#ffffff",

          fontSize: "12px",

          pointerEvents: "none",
        }}
      >
        {/* Moving */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              display: "inline-block",

              width: "10px",
              height: "10px",

              borderRadius:
                "50% 50% 50% 0",

              background:
                "#31D67B",

              transform:
                "rotate(-45deg)",

              border:
                "1px solid white",
            }}
          />

          Moving
        </span>

        {/* Offline */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              display: "inline-block",

              width: "10px",
              height: "10px",

              borderRadius:
                "50% 50% 50% 0",

              background:
                "#FF5C5C",

              transform:
                "rotate(-45deg)",

              border:
                "1px solid white",
            }}
          />

          Offline
        </span>
      </div>
    </section>
  );
};

export default MapPlaceholder;
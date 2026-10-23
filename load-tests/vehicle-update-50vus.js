import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "30s",
};

const vehicleIds = [
  "V001",
  "V999",
  "V929",
  "V899",
  "V189",
  "V900",
  "V976",
  "V835",
  "VH001",
  "VH7601",
];

export default function () {
  const vehicleId = vehicleIds[(__VU - 1) % vehicleIds.length];

  const payload = JSON.stringify({
    latitude: 13.1 + Math.random() * 0.2,
    longitude: 80.0 + Math.random() * 0.3,
    speed: Math.floor(Math.random() * 100),
    status: "Active",
  });

  const response = http.put(
    `http://localhost:5050/vehicles/${vehicleId}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  check(response, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
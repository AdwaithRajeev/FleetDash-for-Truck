import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 10,
    duration: "10s",
};

export default function () {

    const payload = JSON.stringify([
        {
            vehicleId: "V001",
            latitude: 17.385,
            longitude: 78.486,
            speed: 55
        },
        {
            vehicleId: "V002",
            latitude: 17.386,
            longitude: 78.487,
            speed: 60
        },
        {
            vehicleId: "V003",
            latitude: 17.387,
            longitude: 78.488,
            speed: 65
        }
    ]);

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = http.post(
        "http://localhost:5050/api/process-coordinates",
        payload,
        params
    );

    check(res, {
        "Status is 200": (r) => r.status === 200,
    });
}
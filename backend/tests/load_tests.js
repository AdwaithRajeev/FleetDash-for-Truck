import http from 'k6/http';   //k6 create n no.of requests and evaluates performance
import { check } from 'k6';

export const options = {
    vus: 10,          // 10 virtual users
    duration: '10s',  // Run for 10 seconds
};

export default function () {

    const payload = JSON.stringify({
        "vehicleId": "V189",
        "driverName": "Ramesh",
        "latitude": 17.385,
        "longitude": 78.486,
        "speed": 55
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(
        'http://localhost:5050/api/process-coordinate',
        payload,
        params
    );

    check(res, {
        'Status is 200': (r) => r.status === 200,
    });
}
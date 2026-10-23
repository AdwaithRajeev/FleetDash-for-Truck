const { io } = require("socket.io-client");

const socket = io("http://localhost:5050", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("vehicleCreated", (data) => {
  console.log("🚗 Vehicle Created:", data);
});

socket.on("vehicleUpdated", (data) => {
  console.log("✏️ Vehicle Updated:", data);
});

socket.on("vehicleDeleted", (data) => {
  console.log("🗑️ Vehicle Deleted:", data);
});

socket.on("connect_error", (err) => {
  console.log("❌ Connection Error:", err.message);
});
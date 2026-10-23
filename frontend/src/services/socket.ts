import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5050";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});
import { io, Socket } from "socket.io-client";

// ✅ Connect to BACKEND, not frontend
// Use localhost:5000 for local dev — Socket.io does NOT go through ngrok
// because the browser connects directly to the backend via WebSocket.
// If you're testing from a device that can't reach localhost:5000,
// swap this to your ngrok URL.
const SOCKET_URL = "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,       // ← We connect manually after auth
    transports: ["websocket", "polling"], // prefer websocket, fallback to polling
});

// ✅ Global debug listener — logs EVERY event from server
socket.onAny((eventName, ...args) => {
    console.log(`📡 [socket.onAny] event="${eventName}"`, args);
});

socket.on("connect", () => {
    console.log("✅ Socket connected, id:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("❌ Socket connect_error:", err.message);
});

socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
});
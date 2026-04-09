import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// ✅ CORS: allow BOTH localhost AND ngrok origins (as an array, not ||)
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

console.log("🔧 Socket.io allowed origins:", ALLOWED_ORIGINS);

export const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
  // Allow both transports
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`🏠 Socket ${socket.id} joined room: ${userId}`);

    // Re-join room recorded in server logs
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, "reason:", reason);
  });

  // Debug: log all incoming events
  socket.onAny((eventName, ...args) => {
    console.log(`📡 [server onAny] socket=${socket.id} event="${eventName}"`, args);
  });
});

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

start();
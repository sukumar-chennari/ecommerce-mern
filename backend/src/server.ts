import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { initCronJobs } from "./jobs/cron";


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

io.use((socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;

    if (!rawCookies) {
      return next(new Error("No cookies"));
    }

    const parsed = cookie.parse(rawCookies);
    const token = parsed.accessToken;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;

  if (!user?.userId) {
    console.log("❌ No user in socket");
    return socket.disconnect();
  }

  socket.join(user.userId);

  console.log("🔐 Secure socket connected:", user.userId);

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, reason);
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

    initCronJobs();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

start();
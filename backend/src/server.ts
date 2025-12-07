import mongoose from "mongoose";

import dotenv from "dotenv";
import app from "./app.ts";


dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
  }
};

start();
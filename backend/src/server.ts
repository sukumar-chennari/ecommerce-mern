import dotenv from "dotenv";
dotenv.config();


import mongoose from "mongoose";


import app from "./app";


const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI as string);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup error:", err);
  }
};

start();
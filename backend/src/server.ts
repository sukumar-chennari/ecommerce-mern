import dotenv from "dotenv";
dotenv.config();


import mongoose from "mongoose";


import app from "./app";


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
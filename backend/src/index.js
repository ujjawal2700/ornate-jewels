import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173" }));
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (_req, res) =>
  res.json({
    service: "ornate-api",
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not configured",
  }),
);
app.use((_req, res) =>
  res
    .status(404)
    .json({
      message:
        "Endpoint not implemented. The storefront currently uses local demo services.",
    }),
);
if (process.env.MONGODB_URI) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
app.listen(process.env.PORT || 5001, "127.0.0.1", () =>
  console.log("Ornate API listening on port " + (process.env.PORT || 5001)),
);

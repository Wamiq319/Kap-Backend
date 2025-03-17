import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || "your_default_local_uri";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 3 * 24 * 60 * 60 * 1000 }, // 3 days session expiry
  })
);

app.use("/auth", authRoutes);

app.listen(5000, () => console.log("Server running"));

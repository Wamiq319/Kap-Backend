import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./Routes/auth.js";
import protectedRoutes from "./Routes/protectedRoutes.js";
import kapRoutes from "./Routes/kapCompany.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ CORS Setup
const allowedOrigins = process.env.CORS_ORIGIN?.split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Secure Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
  })
);

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/protected/kap", kapRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

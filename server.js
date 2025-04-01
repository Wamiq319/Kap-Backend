import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./Routes/auth.js";
import userRoutes from "./Routes/user.js";
import employeeRoutes from "./Routes/employee.js";

import protectedRoutes from "./Routes/protectedRoutes.js";
import kapRoutes from "./Routes/kap.js";
import govRoutes from "./Routes/gov.js";
import opRoutes from "./Routes/op.js";
import ticketRoutes from "./Routes/ticket.js";

dotenv.config();

const app = express();
app.use(express.json());

//  Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

//  Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// CORS Setup
const allowedOrigins = process.env.CORS_ORIGIN?.split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Secure Session Configuration
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
      sameSite: process.env.SAME_SITE,
      domain: process.env.DOMAIN,
    },
  })
);

// Base Routes
app.use("/auth", authRoutes);
app.use("/protected/user", userRoutes);

app.use("/protected", protectedRoutes);
app.use("/protected/kap", kapRoutes);
app.use("/protected/gov", govRoutes);
app.use("/protected/op", opRoutes);
app.use("/protected/tkt", ticketRoutes);
app.use("/protected/employee", employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

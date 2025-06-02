import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { networkInterfaces } from "os";

import authRoutes from "./Routes/auth.js";
import userRoutes from "./Routes/user.js";
import employeeRoutes from "./Routes/employee.js";

import protectedRoutes from "./Routes/protectedRoutes.js";
import govRoutes from "./Routes/gov.js";
import opRoutes from "./Routes/op.js";
import ticketRoutes from "./Routes/ticket.js";

import { sendSMS } from "./Utils/sendMessage.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Enable trust proxy for accurate IPs behind proxies like Nginx
app.set("trust proxy", true);

// ✅ Enhanced logging middleware
app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;
  const origin = req.headers.origin || "Unknown origin";
  const userAgent = req.headers["user-agent"] || "Unknown agent";

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`🔍 Origin: ${origin}`);
  console.log(`🌍 IP Address: ${ip}`);
  console.log(`📱 User-Agent: ${userAgent}\n`);

  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    initializeCleanupJob();
  })
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

// Route Handlers
app.use("/auth", authRoutes);
app.use("/protected/user", userRoutes);
app.use("/protected", protectedRoutes);
app.use("/protected/gov", govRoutes);
app.use("/protected/op", opRoutes);
app.use("/protected/tkt", ticketRoutes);
app.use("/protected/employee", employeeRoutes);

// Ticket Cleanup Job
function initializeCleanupJob() {
  const Ticket = mongoose.model("Ticket");
  runCleanup();

  const cleanupInterval = setInterval(runCleanup, 24 * 60 * 60 * 1000); // Every 24 hrs

  process.on("SIGINT", () => {
    clearInterval(cleanupInterval);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    clearInterval(cleanupInterval);
    process.exit(0);
  });

  async function runCleanup() {
    try {
      console.log("🚀 Starting ticket cleanup job...");
      const deletedCount = await Ticket.deleteClosedTickets();
      console.log(`✅ Deleted ${deletedCount} old closed tickets`);
    } catch (error) {
      console.error("❌ Error in ticket cleanup job:", error);
    }
  }
}

// Utility to get local IP address for logging
function getLocalIpAddress() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "0.0.0.0";
}

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  const localIp = getLocalIpAddress();

  console.log("\n===============================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Available at:");
  console.log(`- Local:    http://localhost:${PORT}`);
  console.log(`- Network:  http://${localIp}:${PORT}`);
  console.log("===============================================\n");

  initializeCleanupJob(); // Optional: in case you want to run again here
});

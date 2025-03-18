import express from "express";
import {
  sessionMiddleware,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", sessionMiddleware, (req, res) => {
  res.json({ message: "Welcome to the dashboard!", user: req.session.user });
});

router.get(
  "/admin",
  sessionMiddleware,
  authorizeRoles(["admin"]),
  (req, res) => {
    res.json({ message: "Welcome Admin, you have full access!" });
  }
);

router.get(
  "/manager",
  sessionMiddleware,
  authorizeRoles(["admin", "manager"]),
  (req, res) => {
    res.json({ message: "Welcome Manager, you have restricted access!" });
  }
);

router.get(
  "/employee",
  sessionMiddleware,
  authorizeRoles(["employee"]),
  (req, res) => {
    res.json({ message: "Hello Employee, you have limited access!" });
  }
);

export default router;

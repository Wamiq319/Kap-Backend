import express from "express";
import { loginUser, logoutUser } from "../Controllers/authController.js";
import { sessionMiddleware } from "../Middlewares/authServices.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/protected", sessionMiddleware, (req, res) => {
  res.json({ message: "Access granted", user: req.session.user });
});

export default router;

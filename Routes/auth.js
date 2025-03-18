import express from "express";
import { loginUser, createSuperUser } from "../Controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);

// TODO:REMOVE THIS ONCE DEVLOPMENT IS DONE
router.post("/create-superuser", createSuperUser);

export default router;

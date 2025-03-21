import express from "express";
const router = express.Router();
import upload from "../Middlewares/uploadMiddleware.js";

import { createGovSector } from "../Controllers/govController.js";

router.post("/create-govSector", upload, createGovSector);

export default router;

import express from "express";

import {
  sessionMiddleware,
  authorizeRoles,
} from "../Middlewares/authMiddleware.js";

import {
  createGovSector,
  getGovSectors,
  getSectorsNames,
} from "../Controllers/govContoller.js";

import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply session middleware to all routes
// router.use(sessionMiddleware);

// Routes for Companies
router.post("/create-sector", upload, createGovSector);
router.get("/sectors", getGovSectors);
router.get("/sector-names", getSectorsNames);

export default router;

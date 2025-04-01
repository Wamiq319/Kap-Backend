import express from "express";

import {
  sessionMiddleware,
  authorizeRoles,
} from "../Middlewares/authMiddleware.js";

import {
  createGovSector,
  getGovSectors,
  getSectorsNames,
  deleteGovSector,
} from "../Controllers/govContoller.js";

const router = express.Router();

// Apply session middleware to all routes
// router.use(sessionMiddleware);

// Routes for Companies
router.post("/create-sector", upload, createGovSector);
router.get("/sectors", getGovSectors);
router.get("/sector-names", getSectorsNames);
router.delete("/delete/:sectorId", deleteGovSector);

export default router;

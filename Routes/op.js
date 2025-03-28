import express from "express";

import {
  sessionMiddleware,
  authorizeRoles,
} from "../Middlewares/authMiddleware.js";
import {
  createOpCompany,
  getOpCompanies,
  getCompanyNames,
} from "../Controllers/opController.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply session middleware to all routes
// router.use(sessionMiddleware);

// Routes for Companies
router.post("/create-company", upload, createOpCompany);
router.get("/companies", getOpCompanies);
router.get("/company-names", getCompanyNames);

export default router;

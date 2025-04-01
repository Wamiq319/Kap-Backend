import express from "express";

import {
  sessionMiddleware,
  authorizeRoles,
} from "../Middlewares/authMiddleware.js";
import {
  createOpCompany,
  getOpCompanies,
  getCompanyNames,
  deleteOpCompany,
} from "../Controllers/opController.js";
import { uploadImage } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply session middleware to all routes
// router.use(sessionMiddleware);

// Routes for Companies
router.post("/create-company", uploadImage, createOpCompany);
router.get("/companies", getOpCompanies);
router.get("/company-names", getCompanyNames);
router.delete("/delete/:companyId", deleteOpCompany);

export default router;

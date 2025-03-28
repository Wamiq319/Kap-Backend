import express from "express";

import {
  sessionMiddleware,
  authorizeRoles,
} from "../Middlewares/authMiddleware.js";

import {
  createKapCompany,
  getKapCompaniesNames,
  getKapCompanies,
  deleteKapCompany,
} from "../Controllers/kapCompany.js";

import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply session middleware to all routes
// router.use(sessionMiddleware);

// Routes for Companies
router.post("/create-company", upload, createKapCompany);
router.get("/companies", getKapCompanies);
router.get("/company-names", getKapCompaniesNames);

export default router;

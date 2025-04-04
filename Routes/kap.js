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

import { uploadImage } from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

// Routes for Companies
router.post("/create-company", uploadImage, createKapCompany);
router.get("/companies", getKapCompanies);
router.get("/company-names", getKapCompaniesNames);
router.delete("/delete/:companyId", deleteKapCompany);

export default router;

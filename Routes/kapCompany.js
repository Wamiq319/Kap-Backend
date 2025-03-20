import express from "express";
import {
  sessionMiddleware,
  authorizeRoles,
} from "../Middlewares/authMiddleware.js";
import {
  createKapCompany,
  getKapCompanies,
  updateKapCompany,
  deleteKapCompany,
} from "../Controllers/kapCompanyController.js";
import upload from "../Middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/create-Company", upload, createKapCompany);

router.get("/get-Companies", getKapCompanies);

// router.get(
//   "/:id",
//   sessionMiddleware,
//   authorizeRoles(["admin"]),
//   getKapCompanyById
// );

router.put("/:id", updateKapCompany);

router.delete("/:id", deleteKapCompany);

export default router;

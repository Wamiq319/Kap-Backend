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

router.post(
  "/create-Company",
  sessionMiddleware,
  authorizeRoles(["admin"]),
  upload,
  createKapCompany
);

router.get(
  "/get-Companies",
  sessionMiddleware,
  authorizeRoles(["admin"]),
  getKapCompanies
);

// router.get(
//   "/:id",
//   sessionMiddleware,
//   authorizeRoles(["admin"]),
//   getKapCompanyById
// );

router.put(
  "/:id",
  sessionMiddleware,
  authorizeRoles(["admin"]),
  updateKapCompany
);

router.delete(
  "/:id",
  sessionMiddleware,
  authorizeRoles(["admin"]),
  deleteKapCompany
);

export default router;

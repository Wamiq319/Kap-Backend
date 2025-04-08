import express from "express";
import {
  createUser,
  createSuperAdmin,
  getGovManagers,
  getOpManagers,
  getKapEmployees,
  deleteUser,
  resetUserPassword,
  updateAdminProfile,
} from "../Controllers/userController.js";

const router = express.Router();

router.post("/create_SuperUser", createSuperAdmin);
router.post("/create", createUser);
router.get("/gov-managers", getGovManagers);
router.get("/op-managers", getOpManagers);
router.get("/kap-employees", getKapEmployees);
router.delete("/delete/:userId", deleteUser);
router.put("/update-password/:userId", resetUserPassword);
router.put("/update-admin/:adminId", updateAdminProfile);
export default router;

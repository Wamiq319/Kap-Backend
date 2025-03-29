import express from "express";
import {
  createUser,
  createSuperAdmin,
  getGovManagers,
  getOpManagers,
  getKapEmployees,
  deleteUser,
} from "../Controllers/userController.js";

const router = express.Router();

router.post("/create_SuperUser", createSuperAdmin);
router.get("/gov-managers", getGovManagers);
router.get("/op-managers", getOpManagers);
router.get("/kap-employees", getKapEmployees);
router.post("/create", createUser);
router.delete("/delete/:userId", deleteUser);

export default router;

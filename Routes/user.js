import express from "express";
import {
  createUser,
  createSuperAdmin,
  getGovManagers,
  getOpManagers,
  getKapEmployees,
} from "../Controllers/userController.js";

const router = express.Router();

router.post("/create_SuperUser", createSuperAdmin);
router.post("/create", createUser);
router.get("/gov-managers", getGovManagers);
router.get("/op-managers", getOpManagers);
router.get("/kap-employees", getKapEmployees);

export default router;

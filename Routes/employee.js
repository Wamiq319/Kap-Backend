import express from "express";

import {
  createEmployee,
  getEmployees,
  deleteEmployee,
} from "../Controllers/employeeController.js";

const router = express.Router();
router.post("/create", createEmployee);
router.get("/get-employees", getEmployees);
router.delete("/delete/:employeeId", deleteEmployee);

export default router;

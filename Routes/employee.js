import express from "express";

import {
  createEmployee,
  getEmployees,
  deleteEmployee,
} from "../Controllers/employeeController.js";

const router = express.Router();
router.post("/create", createEmployee);
router.get("/get-employees", getEmployees);
router.get("/get-employeeNames", getEmployees);
router.delete("/delete/:employeeId", deleteEmployee);

export default router;

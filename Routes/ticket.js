import express from "express";
import {
  createTicket,
  getTickets,
  updateAssignedTo,
  addProgress,
  updateStatus,
} from "../Controllers/ticketController.js";

const router = express.Router();
import { uploadAttachment } from "../Middlewares/uploadMiddleware.js";

router.post("/create", uploadAttachment, createTicket);
router.get("/tickets", getTickets);
router.patch("/assign/:ticketId", updateAssignedTo);
router.patch("/progress/:ticketId", addProgress);
router.patch("/status/:ticketId", updateStatus);

export default router;

import express from "express";
import {
  createTicket,
  getTickets,
  updateAssignedTo,
  addProgress,
  updateStatus,
  createTransferRequest,
  addNote,
} from "../Controllers/ticketController.js";

const router = express.Router();
import { uploadAttachment } from "../Middlewares/uploadMiddleware.js";

router.post("/create", uploadAttachment, createTicket);
router.get("/tickets", getTickets);
router.patch("/assign/:ticketId", updateAssignedTo);
router.patch("/progress/:ticketId", addProgress);
router.patch("/status/:ticketId", updateStatus);
router.patch("/transfer-request/:ticketId", createTransferRequest);
router.patch("/add-note/:ticketId", addNote);

export default router;

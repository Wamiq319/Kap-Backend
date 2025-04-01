import express from "express";
import { createTicket, getTickets } from "../Controllers/ticketController.js";

const router = express.Router();
import { uploadAttachment } from "../Middlewares/uploadMiddleware.js";

router.post("/create", uploadAttachment, createTicket);
router.get("/tickets", getTickets);

export default router;

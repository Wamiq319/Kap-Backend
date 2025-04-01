import express from "express";
import { createTicket, getTickets } from "../Controllers/ticketController.js";

const router = express.Router();
import upload from "../Middlewares/uploadMiddleware.js";

router.post("/create", upload, createTicket);
router.get("/tickets", getTickets);

export default router;

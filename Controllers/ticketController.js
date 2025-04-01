import Ticket from "../Models/tickets.js";

export const createTicket = async (req, res) => {
  try {
    const {
      operator,
      requestor,
      location,
      requestType,
      expectedCompletionDate,
    } = req.body;

    if (
      !operator ||
      !requestor ||
      !location ||
      !requestType ||
      !expectedCompletionDate
    ) {
      console.log(govSector, adminName, mobile, username, password);
      return res.status(400).json({
        message: "All fields are required",
        data: [],
        success: false,
      });
    }

    const { success, data, message } = await Ticket.createEntity({
      operator,
      requestor,
      location,
      requestType,
      expectedCompletionDate,
    });

    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Error creating Ticket" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { userRole, userId } = req.query;

    if (!userRole || !userId) {
      return res.status(400).json({
        message: "userRole and userId are required as query parameters",
        data: [],
        success: false,
      });
    }

    if (!userRole || !userId) {
      return res.status(400).json({
        message: "userRole  and id Is required",
        data: [],
        success: false,
      });
    }

    const { success, data, message } = await Ticket.getAllEntities({
      userRole,
      userId,
    });

    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Error creating Ticket" });
  }
};

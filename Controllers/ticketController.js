import Ticket from "../Models/tickets.js";
//Create Ticket
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
// Get Tickets
export const getTickets = async (req, res) => {
  try {
    const { userRole, userId } = req.query;
    console.log(userRole, userId);
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

// Update Assigned To
export const updateAssignedTo = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedToId, assigneeType } = req.body;

    if (!ticketId || !assignedToId) {
      return res.status(400).json({
        message: "ticketId and assignedToId are required",
        success: false,
        data: [],
      });
    }
    if (!["opEmployee", "govEmployee"].includes(assigneeType)) {
      return {
        success: false,
        message: "Invalid assignee type. Must be 'opEmployee' or 'govEmployee'",
        data: [],
      };
    }

    const result = await Ticket.updateAssignedTo(
      ticketId,
      assignedToId,
      assigneeType
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Update AssignedTo Error:", error);
    res.status(500).json({
      message: "Internal Server Error updating assignment",
      success: false,
      data: [],
    });
  }
};

// Add Progress
export const addProgress = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { percentage, observation } = req.body;

    if (!ticketId || percentage === undefined || !observation) {
      return res.status(400).json({
        message: "ticket, percentage and observation are required",
        success: false,
        data: [],
      });
    }

    const result = await Ticket.addProgress(ticketId, percentage, observation);

    if (!result.success) {
      const statusCode = result.message.includes("not found") ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Add Progress Error:", error);
    res.status(500).json({
      message: "Internal Server Error adding progress",
      success: false,
      data: null,
    });
  }
};

// Update Status
export const updateStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    console.log(ticketId);

    if (!ticketId || !status) {
      return res.status(400).json({
        message: "ticketId and status are required",
        success: false,
        data: [],
      });
    }
    const validStatuses = ["Open", "In Progress", "Completed", "Closed"];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid status",
        data: [],
      };
    }

    const result = await Ticket.updateStatus(ticketId, status);

    if (!result.success) {
      const statusCode = result.message.includes("not found") ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      message: "Internal Server Error updating status",
      success: false,
      data: null,
    });
  }
};

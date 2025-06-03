import Ticket from "../Models/tickets.js";
import { sendSMS } from "../Utils/sendMessage.js";
import dotenv from "dotenv";
dotenv.config();

const appUrl = process.env.APP_URL;

const sendTicketNotification = async (mobile, message) => {
  if (!mobile) {
    console.warn("Notification skipped - no mobile number provided");
    return { success: false, message: "No mobile number provided" };
  }

  try {
    const result = await sendSMS(mobile, message);
    console.log(`SMS sent to ${mobile}:`, result);
    return result;
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, message: "Failed to send SMS" };
  }
};

//Create Ticket
export const createTicket = async (req, res) => {
  try {
    const {
      operator,
      requestor,
      location,
      requestType,
      expectedCompletionDate,
      ticketBuilder,
    } = req.body;

    if (
      !operator ||
      !requestor ||
      !location ||
      !requestType ||
      !ticketBuilder
    ) {
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
      ticketBuilder,
    });

    if (success) {
      const [operatorDetails, requestorDetails] = await Promise.all([
        Ticket.getOperatorDetails(operator),
        Ticket.getRequestorDetails(requestor),
      ]);

      const operatorMessage = `تم إنشاء تذكرة جديدة لمؤسستك.
نوع التذكرة: ${requestType}
تم الإنشاء بواسطة: ${ticketBuilder} (موظف كاب)
المشغل: ${operatorDetails?.adminName} (${operatorDetails?.opCompany})
رابط التذكرة: ${appUrl}`;

      const requestorMessage = `تم إنشاء تذكرة جديدة لمؤسستك.
نوع التذكرة: ${requestType}
تم الإنشاء بواسطة: ${ticketBuilder} (موظف كاب)
المشغل: ${operatorDetails?.adminName} (${operatorDetails?.opCompany})
رابط التذكرة: ${appUrl}`;

      await Promise.all([
        sendTicketNotification(operatorDetails?.mobile, operatorMessage),
        sendTicketNotification(requestorDetails?.mobile, requestorMessage),
      ]);
    }

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
    const employee = await mongoose
      .model("Employee")
      .findById(assignedToId)
      .select("mobile name");

    const ticket = await Ticket.findById(ticketId)
      .populate("operator", "opCompany")
      .populate("requestor", "govSector");

    if (employee?.mobile) {
      const smsMessage = `تم تعيينك على تذكرة جديدة  
الجهة: ${
        assigneeType === "opEmployee"
          ? ticket.requestor?.govSector
          : ticket.operator?.opCompany
      }  
نوع الطلب: ${ticket.requestType}  
رابط التذكرة: ${appUrl}`;

      await sendTicketNotification(employee.mobile, smsMessage);
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
    const { percentage, observation, addedBy } = req.body;

    if (!ticketId || percentage === undefined || !observation) {
      return res.status(400).json({
        message: "ticket, percentage and observation are required",
        success: false,
        data: [],
      });
    }

    const result = await Ticket.addProgress(
      ticketId,
      percentage,
      observation,
      addedBy
    );

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
    const { status, acceptedBy, expectedCompletionDate } = req.body;

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

    const result = await Ticket.updateStatus(
      ticketId,
      status,
      acceptedBy,
      expectedCompletionDate
    );

    if (result.success) {
      const ticket = await Ticket.findById(ticketId)
        .populate("operator", "mobile opCompany")
        .populate("requestor", "mobile govSector");

      let message = "";
      if (status === "In Progress") {
        message = `تم بدء العمل على تذكرتك  
رقم التذكرة: ${ticket.ticketNumber}  
الحالة: جاري العمل  
رابط التذكرة: ${appUrl}`;
      } else if (status === "Completed") {
        message = `تم إكمال تذكرتك  
رقم التذكرة: ${ticket.ticketNumber}  
الحالة: مكتمل  
رابط التذكرة: ${appUrl}`;
      }

      // Send to both parties if message exists
      if (message) {
        await Promise.all([
          sendTicketNotification(ticket.operator?.mobile, message),
          sendTicketNotification(ticket.requestor?.mobile, message),
        ]);
      }
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

// Add Note to Ticket
export const addNote = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { addedBy, text } = req.body;

    // Validate input
    if (!ticketId || !addedBy || !text) {
      return res.status(400).json({
        message: "ticketId, addedBy and text are all required",
        success: false,
        data: [],
      });
    }

    // Call the model method
    const result = await Ticket.addNote(ticketId, addedBy, text);

    res.status(200).json(result);
  } catch (error) {
    console.error("Add Note Error:", error);
    res.status(500).json({
      message: "Internal Server Error adding note",
      success: false,
      data: null,
    });
  }
};

// Create Transfer Request
export const createTransferRequest = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { transferType, message } = req.body;

    // Basic validation
    if (!ticketId || !transferType || !message) {
      return res.status(400).json({
        message: "ticketId, transferType and message are required",
        success: false,
        data: [],
      });
    }

    // Validate transferType
    if (!["op", "gov"].includes(transferType)) {
      return res.status(400).json({
        message: "Invalid transferType. Must be 'op' or 'gov'",
        success: false,
        data: [],
      });
    }

    // Call the model method
    const result = await Ticket.OpenTransferRequest(
      ticketId,
      transferType,
      message
    );

    // Handle response
    if (!result.success) {
      const statusCode = result.message.includes("not found") ? 404 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Create Transfer Request Error:", error);
    res.status(500).json({
      message: "Internal Server Error creating transfer request",
      success: false,
      data: null,
    });
  }
};

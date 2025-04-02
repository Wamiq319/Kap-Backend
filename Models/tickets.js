import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OpCompany",
    default: null,
  },
  requestor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GovSector",
    default: null,
  },
  location: {
    type: String,
    required: true,
  },
  requestType: {
    type: String,
    required: true,
    trim: true,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Completed", "Closed"],
    default: "Open",
  },
  progress: [
    {
      percentage: { type: Number, min: 0, max: 100, required: true },
      observation: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  atachment: { type: String, default: null },
  expectedCompletionDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ticketSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    if (this.ticketNumber) return next();

    const count = await this.constructor.countDocuments();
    this.ticketNumber = (count + 1).toString().padStart(4, "0");

    next();
  } catch (err) {
    next(err);
  }
});

ticketSchema.statics.createEntity = async function (entityData) {
  try {
    const newEntity = await this.create(entityData);
    return {
      success: true,
      message: newEntity.requestType + "Created Successfully",
      data: [],
    };
  } catch (error) {
    console.error("Ticket creation error:", error);
    return {
      success: false,
      message: "Try Again Later",
      data: [],
    };
  }
};

ticketSchema.statics.getAllEntities = async function (data) {
  try {
    const { userRole, userId } = data;

    let query = { status: { $ne: "Closed" } }; // Exclude Closed tickets
    let projection = {};

    switch (userRole) {
      case "kap_employee":
        projection = {
          requestType: 1,
          ticketNumber: 1,
          operator: 1,
          requestor: 1,
          location: 1,
          atachment: 1,
          expectedCompletionDate: 1,
          createdAt: 1,
        };
        break;
      case "gov_manager":
        query.requestor = userId;
        projection = {
          ticketNumber: 1,
          operator: 1,
          location: 1,
          requestType: 1,
          status: 1,
          progress: 1,
          expectedCompletionDate: 1,
          atachment: 1,
          createdAt: 1,
        };
        break;
      case "op_manager":
        query.operator = userId;
        projection = {
          ticketNumber: 1,
          location: 1,
          requestType: 1,
          assignedTo: 1,
          status: 1,
          progress: 1,
          expectedCompletionDate: 1,
          atachment: 1,
        };
        break;
      case "op_employee":
        query.assignedTo = userId;
        projection = {
          ticketNumber: 1,
          requestor: 1,
          location: 1,
          requestType: 1,
          status: 1,
          progress: 1,
          expectedCompletionDate: 1,
          atachment: 1,
        };
        break;
      default:
        return { success: false, data: [], message: "Unauthorized access" };
    }

    const entities = await this.find(query, projection)
      .populate("operator", "opCompany -_id")
      .populate("requestor", "govSector -_id")
      .populate("assignedTo", "name")
      .lean();

    const transformedEntities = entities.map((ticket) => ({
      ...ticket,
      operator: ticket.operator ? ticket.operator.opCompany : null,
      requestor: ticket.requestor ? ticket.requestor.govSector : null,
      assignedTo: ticket.assignedTo ? ticket.assignedTo.name : null,
    }));

    return { success: true, data: transformedEntities, message: null };
  } catch (error) {
    console.error("Error in getAllEntities:", error);
    return {
      success: false,
      message: "Error while fetching tickets",
      data: [],
    };
  }
};

ticketSchema.statics.updateAssignedTo = async function (
  ticketId,
  assignedToId
) {
  try {
    const updatedTicket = await this.findByIdAndUpdate(
      ticketId,
      {
        $set: { assignedTo: assignedToId },
        $push: {
          progress: {
            percentage: 0, // Reset progress when reassigned
            observation: `Ticket reassigned to new employee`,
          },
        },
      },
      { new: true } // Return the updated document
    ).populate("assignedTo", "name");

    if (!updatedTicket) {
      return {
        success: false,
        message: "Ticket not found",
        data: [],
      };
    }

    return {
      success: true,
      message:
        updatedTicket.assignedTo.name +
        " has been successfully assigned the ticket.",
      data: [],
    };
  } catch (error) {
    console.error("Error updating assignedTo:", error);
    return {
      success: false,
      message: "Error updating ticket assignment",
      data: null,
    };
  }
};

ticketSchema.statics.updateStatus = async function (ticketId, newStatus) {
  try {
    const validTransitions = {
      Open: "In Progress",
      "In Progress": "Completed",
      Completed: "Closed",
    };

    const ticket = await this.findById(ticketId);
    if (!ticket)
      return { success: false, message: "Ticket not found", data: [] };

    if (validTransitions[ticket.status] !== newStatus) {
      return {
        success: false,
        message: `Invalid status transition currently is in ${ticket.status} status`,
        data: [],
      };
    }

    const updatedTicket = await this.findByIdAndUpdate(
      ticketId,
      { status: newStatus, updatedAt: new Date() },
      { new: true }
    );

    return {
      success: true,
      message: `Ticket status updated to ${newStatus}`,
      data: [],
    };
  } catch (error) {
    console.error("Error updating status:", error);
    return {
      success: false,
      message: "Error updating ticket status",
      data: [],
    };
  }
};
ticketSchema.statics.addProgress = async function (
  ticketId,
  percentage,
  observation
) {
  try {
    if (!observation || typeof observation !== "string") {
      return {
        success: false,
        message: "Observation is required and must be a string",
        data: [],
      };
    }

    const updatedTicket = await this.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          progress: {
            percentage: percentage,
            observation: observation,
            date: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedTicket) {
      return {
        success: false,
        message: "Ticket not found",
        data: [],
      };
    }

    return {
      success: true,
      message: "Progress Added successfully",
      data: [],
    };
  } catch (error) {
    console.error("Error adding progress:", error);
    return {
      success: false,
      message: "Error updating ticket progress",
      data: null,
    };
  }
};

export default mongoose.model("Ticket", ticketSchema);

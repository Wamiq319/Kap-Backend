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
    type: {
      opEmployee: {
        // For operator company employees
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
      },
      govEmployee: {
        // For government employees
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        default: null,
      },
    },
    default: {},
  },
  opTransferReq: {
    type: String,
    default: null,
  },
  govTransferReq: {
    type: String,
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
  notes: [
    {
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "notes.userType",
        required: true,
      },
      userType: {
        type: String,
        enum: ["OpCompany", "GovSector"],
        required: true,
      },
      text: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
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

    let query = { status: { $ne: "Closed" } };
    let projection = {};
    let populateAssignees = [];

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
          progress: 1,
          notes: 1,
          status: 1,
        };
        break;

      case "gov_manager":
        query = {
          requestor: userId,
          status: { $nin: ["Open", "Closed"] },
        };
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
          govTransferReq: 1,
          "assignedTo.govEmployee": 1,
        };
        populateAssignees = ["assignedTo.govEmployee"];
        break;

      case "op_manager":
        query.operator = userId;
        projection = {
          ticketNumber: 1,
          location: 1,
          requestType: 1,
          status: 1,
          progress: 1,
          expectedCompletionDate: 1,
          atachment: 1,
          opTransferReq: 1,
          "assignedTo.opEmployee": 1,
        };
        populateAssignees = ["assignedTo.opEmployee"];
        break;

      case "op_employee":
        query["assignedTo.opEmployee"] = userId;
        projection = {
          ticketNumber: 1,
          requestor: 1,
          location: 1,
          requestType: 1,
          status: 1,
          progress: 1,
          expectedCompletionDate: 1,
          opTransferReq: 1,
          atachment: 1,
        };
        break;

      case "gov_employee":
        query["assignedTo.govEmployee"] = userId;
        projection = {
          ticketNumber: 1,
          operator: 1,
          location: 1,
          requestType: 1,
          status: 1,
          progress: 1,
          expectedCompletionDate: 1,
          atachment: 1,
          govTransferReq: 1,
        };
        break;

      default:
        return { success: false, data: [], message: "Unauthorized access" };
    }

    // Base query with common populations
    let queryBuilder = this.find(query, projection)
      .populate("operator", "opCompany -_id")
      .populate("requestor", "govSector -_id");

    // Add role-specific population
    populateAssignees.forEach((field) => {
      queryBuilder = queryBuilder.populate(field, "name");
    });

    const entities = await queryBuilder.lean();

    const transformedEntities = entities.map((ticket) => {
      let assignedToName = null;

      if (ticket.assignedTo) {
        if (userRole === "gov_manager") {
          assignedToName = ticket.assignedTo.govEmployee?.name || null;
        } else if (userRole === "op_manager") {
          assignedToName = ticket.assignedTo.opEmployee?.name || null;
        }
        // For op_employee and gov_employee, we don't show assignedTo name
        // as they're seeing tickets assigned to themselves
      }

      return {
        ...ticket,
        operator: ticket.operator ? ticket.operator.opCompany : null,
        requestor: ticket.requestor ? ticket.requestor.govSector : null,
        assignedTo: assignedToName,
      };
    });

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
  employeeId,
  assigneeType // 'opEmployee' or 'govEmployee'
) {
  try {
    if (!["opEmployee", "govEmployee"].includes(assigneeType)) {
      return {
        success: false,
        message: "Invalid assignee type. Must be 'opEmployee' or 'govEmployee'",
        data: [],
      };
    }

    const employee = await mongoose.model("Employee").findById(employeeId);
    if (!employee) {
      return {
        success: false,
        message: "Employee not found",
        data: [],
      };
    }

    // 3. Validate role matches assignment type
    const requiredRole =
      assigneeType === "opEmployee" ? "op_employee" : "gov_employee";
    if (employee.role !== requiredRole) {
      return {
        success: false,
        message: `Employee must be a ${requiredRole}`,
        data: [],
      };
    }

    // 4. Prepare the update
    const update = {
      $set: {
        [`assignedTo.${assigneeType}`]: employeeId,
        updatedAt: new Date(),
        ...(assigneeType === "opEmployee"
          ? { opTransferReq: null }
          : { govTransferReq: null }),
      },
    };

    // 5. Execute the update
    const updatedTicket = await this.findByIdAndUpdate(ticketId, update, {
      new: true,
    })
      .populate(`assignedTo.${assigneeType}`, "name")
      .lean();

    if (!updatedTicket) {
      return {
        success: false,
        message: "Ticket not found",
        data: [],
      };
    }

    // 6. Prepare the response
    const assignedName =
      updatedTicket.assignedTo[assigneeType]?.name || "Unknown";

    return {
      success: true,
      message: `${assignedName} assigned successfully as ${assigneeType}`,
      data: [],
    };
  } catch (error) {
    console.error("Assignment error:", error);
    return {
      success: false,
      message: "Assignment failed",
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

ticketSchema.statics.OpenTransferRequest = async function (
  ticketId,
  transferType, // 'op' or 'gov'
  message
) {
  try {
    // Initialize empty update object
    const update = { $set: {} };

    // Set the appropriate transfer field
    if (transferType === "op") {
      update.$set.opTransferReq = message;
    } else if (transferType === "gov") {
      update.$set.govTransferReq = message;
    } else {
      return {
        success: false,
        message: "Invalid transfer type. Must be 'op' or 'gov'",
        data: [],
      };
    }

    const updatedTicket = await this.findByIdAndUpdate(ticketId, update, {
      new: true,
    });

    if (!updatedTicket) {
      return {
        success: false,
        message: "Ticket not found",
        data: [],
      };
    }

    return {
      success: true,
      message: "Transfer request added successfully",
      data: [],
    };
  } catch (error) {
    console.error("Error creating transfer request:", error);
    return {
      success: false,
      message: "Error creating transfer request",
      data: null,
    };
  }
};

export default mongoose.model("Ticket", ticketSchema);

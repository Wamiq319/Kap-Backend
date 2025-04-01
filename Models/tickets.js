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
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    observations: { type: String, default: "" },
  },
  atachment: { type: String, default: "" },
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
      message: newEntity.requestType + " Ticket Created Successfully",
      data: [],
    };
  } catch (error) {
    console.error("Ticket creation error:", error);
    return {
      success: false,
      message: error.message,
      data: [],
    };
  }
};

ticketSchema.statics.getAllEntities = async function (data) {
  try {
    const { userRole, userId } = data;
    let query = {};
    let projection = {};

    switch (userRole) {
      case "kap_employee":
        projection = {
          ticketNumber: 1,
          operator: 1,
          requestor: 1,
          location: 1,
          requestType: 1,
          assignedTo: 1,
          status: 1,
          progress: 1,
          atachment: 1,
          expectedCompletionDate: 1,
          createdAt: 1,
          updatedAt: 1,
        };
        break;
      case "gov_manager":
        // Government managers see tickets they requested with specific fields
        query = { requestor: userId };
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
        // Operator managers see tickets assigned to their company
        query = { operator: userId };
        projection = {
          ticketNumber: 1,
          requestor: 1,
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
        // Operator employees see tickets assigned to them
        query = { assignedTo: userId };
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
        return {
          success: false,
          data: [],
          message: "Unauthorized access",
        };
    }

    const entities = await this.find(query, projection)
      .populate("operator", "name")
      .populate("requestor", "name")
      .populate("assignedTo", "name");

    return {
      success: true,
      data: entities,
      message: null,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error while fetching tickets",
      data: [],
    };
  }
};

export default mongoose.model("Ticket", ticketSchema);

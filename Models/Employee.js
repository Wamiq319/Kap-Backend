import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  mobile: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["op_employee", "gov_employee"],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: function () {
      return this.role === "op_employee" ? "OpCompany" : "GovSector";
    },
  },
});

// Generate username based on role
employeeSchema.statics.generateUsername = async function (role, baseName) {
  try {
    const rolePrefixes = {
      op_employee: "OPE",
      gov_employee: "GOVE",
    };

    const prefix = rolePrefixes[role] || "EMP";
    let username;

    while (true) {
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase();

      username = `${baseName}${prefix}${randomSuffix}`;
      const existingUser = await this.findOne({ username });
      if (!existingUser) break;
    }

    return username;
  } catch (error) {
    throw new Error("Username generation failed");
  }
};

// CREATE EMPLOYEE with auto-generated username
employeeSchema.statics.createEmployee = async function (employeeData) {
  try {
    const existingUser = await this.findOne({ mobile: employeeData.mobile });
    if (existingUser) {
      return {
        success: false,
        message:
          "Mobile number already exists in the system. Use another number",
        data: [],
      };
    }
    const existingUsername = await this.findOne({
      username: employeeData.username,
    });
    if (existingUsername) {
      return {
        success: false,
        message: "User not created.Username already exists",
        data: [],
      };
    }
    // Generate username

    const newEmployee = await this.create(employeeData);
    return {
      success: true,
      message: newEmployee.username + " created successfully",
      data: newEmployee,
    };
  } catch (error) {
    console.error("Create employee error:", error);
    return {
      data: [],
      success: false,
      message: "internal server error ",
    };
  }
};

// LOGIN with populated data
employeeSchema.statics.login = async function (username, password) {
  try {
    const employee = await this.findOne({ username }).populate("entityId");

    if (!employee) {
      return { success: false, message: "User not found", data: [] };
    }

    if (password !== employee.password) {
      return { success: false, message: "Invalid password" };
    }
    console.log(employee);
    const responseData = {
      id: employee._id,
      name: employee.name,
      username: employee.username,
      role: employee.role,
    };

    // Add organization info based on role
    if (employee.role === "op_employee") {
      // Refer to the opCompany field in the populated entityId (opCompany schema)
      responseData.entity = {
        name: employee.entityId?.opCompany || null,
        id: employee.entityId?._id,
        logo: employee.entityId?.logoImage,
      };
    } else if (employee.role === "gov_employee") {
      // Refer to the govSector name field in the populated entityId (govSector schema)
      responseData.entity = {
        name: employee.entityId?.govSector || null,
        id: employee.entityId?._id,
        logo: employee.entityId?.logoImage,
      };
    }

    return {
      success: true,
      message: "Login successful",
      data: responseData,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed" };
  }
};

// UPDATE PASSWORD
employeeSchema.statics.rsesetEmployeePassword = async function (
  employeeId,
  newPassword,
  oldPassword = null
) {
  try {
    console.log(employeeId, newPassword, oldPassword);
    const employee = await this.findById(employeeId);
    if (!employee) {
      return {
        message: "Employee not found",
        success: false,
        data: [],
      };
    }
    if (employee.password !== oldPassword) {
      return {
        message: "Incorrect old Password",
        success: false,
        data: [],
      };
    }
    const updatedEmployee = await this.findByIdAndUpdate(
      employeeId,
      { password: newPassword },
      { new: true }
    );

    return {
      success: true,
      message: "Password updated successfully",
      data: updatedEmployee,
    };
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, message: "Password update failed" };
  }
};

// DELETE EMPLOYEE
employeeSchema.statics.deleteEmployee = async function (employeeId) {
  try {
    const deletedEmployee = await this.findByIdAndDelete(employeeId);

    if (!deletedEmployee) {
      return { success: false, message: "Employee not found" };
    }

    return {
      success: true,
      message: deletedEmployee.username + "deleted successfully",
      data: [],
    };
  } catch (error) {
    console.error("Delete employee error:", error);
    return { success: false, message: "Failed to delete employee", data: [] };
  }
};

// GET EMPLOYEES
// GET EMPLOYEES
employeeSchema.statics.getEmployees = async function (entityData) {
  const { role, entityId } = entityData;
  try {
    let query = {};

    if (entityId === "Get_All") {
      if (role) {
        query.role = role;
      }
    } else {
      query.role = role;
      query.entityId = entityId;
    }

    const employees = await this.find(query).populate({
      path: "entityId",
      select: "opCompany govSector logoImage",
    });

    if (employees.length === 0) {
      return {
        success: true,
        data: [],
        message: "No employees found",
      };
    }

    return {
      success: true,
      data: employees.map((emp) => ({
        id: emp._id,
        name: emp.name,
        username: emp.username,
        mobile: emp.mobile,
        password: emp.password,
        role: emp.role,
        entityId: emp.entityId?._id,
        entityName:
          emp.role === "op_employee"
            ? emp.entityId?.opCompany
            : emp.entityId?.govSector,
        entityImage: emp.entityId?.logoImage,
      })),
      message: "Employees fetched successfully",
    };
  } catch (error) {
    console.error("Get employees error:", error);
    return {
      success: false,
      message: "Internal Server EK)rror",
      data: [],
    };
  }
};
export default mongoose.model("Employee", employeeSchema);

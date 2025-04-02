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
    // Generate username
    employeeData.username = await this.generateUsername(
      employeeData.role,
      employeeData.name.substring(0, 3).toLowerCase()
    );

    const newEmployee = await this.create(employeeData);
    return {
      success: true,
      message: newEmployee.username + " created successfully",
      data: [],
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
    const employee = await this.findOne({ username }).populate(
      "entityId",
      "name"
    );

    if (!employee) {
      return { success: false, message: "User not found", data: [] };
    }

    if (password !== employee.password) {
      return { success: false, message: "Invalid password" };
    }

    const responseData = {
      id: employee._id,
      name: employee.name,
      username: employee.username,
      role: employee.role,
    };

    // Add organization info based on role
    if (employee.role === "op_employee") {
      responseData.company = employee.entityId?.name || null;
    } else if (employee.role === "gov_employee") {
      responseData.sector = employee.entityId?.name || null;
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
employeeSchema.statics.updatePassword = async function (
  employeeId,
  newPassword
) {
  try {
    const updatedEmployee = await this.findByIdAndUpdate(
      employeeId,
      { password: newPassword },
      { new: true }
    );

    if (!updatedEmployee) {
      return { success: false, message: "Employee not found" };
    }

    return {
      success: true,
      message: "Password updated successfully",
      data: {
        id: updatedEmployee._id,
        username: updatedEmployee.username,
      },
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

// GET EMPLOYEES BY ROLE and entityId
employeeSchema.statics.getEmployees = async function (entityData) {
  const { role, entityId } = entityData;
  try {
    const employees = await this.find({
      role: role,
      entityId: entityId,
    });

    if (employees.length === 0) {
      return {
        success: true,
        data: [],
        message: "No employees",
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
      })),
      message: "Employees Fetched",
    };
  } catch (error) {
    console.error("Get employees error:", error);
    return {
      success: false,
      message: "Internal Server Error",
      data: [],
    };
  }
};

export default mongoose.model("Employee", employeeSchema);

import Employee from "../Models/Employee.js";

// Create Employee
export const createEmployee = async (req, res) => {
  const { name, username, mobile, password, role, entityId } = req.body;
  console.log(req.body);
  if (!username || !mobile || !password || !role || !entityId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
      data: [],
    });
  }

  try {
    const { success, message, data } = await Employee.createEmployee({
      name,
      username,
      mobile,
      password,
      role,
      entityId,
    });

    const status = success ? 201 : 400;
    res.status(status).json({ success, message, data });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      data: [],
    });
  }
};

// Update Employee Password
export const updateEmployeePassword = async (req, res) => {
  const { employeeId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword)
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });

  try {
    const { success, message, data } = await Employee.updatePassword(
      employeeId,
      newPassword
    );

    const status = success ? 200 : 400;
    res.status(status).json({ success, message, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password update failed",
    });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const { success, message, data } = await Employee.deleteEmployee(
      employeeId
    );
    const status = success ? 200 : 404;
    res.status(status).json({ success, message, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
    });
  }
};

// Get All Employees by Role
export const getEmployees = async (req, res) => {
  const { role, entityId } = req.query;
  console.log(req.query);

  if (!["op_employee", "gov_employee"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role specified",
      data: [],
    });
  }

  try {
    const { data, success, message } = await Employee.getEmployees({
      role,
      entityId,
    });

    res.status(200).json({
      success: success,
      data: data,
      message: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Employees",
      data: [],
    });
  }
};

export const getEmployeeNames = async (req, res) => {
  const { role, entityId } = req.query;

  if (!["op_employee", "gov_employee"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role specified",
      data: [],
    });
  }

  try {
    const { data, success, message } = await Employee.getEmployees({
      role,
      entityId,
    });

    res.status(200).json({
      success: success,
      data: data,
      message: message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch Employees",
      data: [],
    });
  }
};

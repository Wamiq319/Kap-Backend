import Employee from "../Models/Employee.js";
import { sendWhatsAppMessage } from "../Utils/sendWhatsAppMessage.js";

// Create Employee
export const createEmployee = async (req, res) => {
  const { name, username, mobile, password, role, entityId } = req.body;

  if (!username || !mobile || !password || !role || !entityId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
      data: [],
    });
  }
  console.log(req.body);
  try {
    // Validate mobile number format

    const { success, message, data } = await Employee.createEmployee({
      name,
      username,
      mobile,
      password,
      role,
      entityId,
    });
    console.log(data);
    if (success) {
      // Ensure mobile number is in international format
      const formattedMobile = mobile.startsWith("+") ? mobile : `+91${mobile}`;

      const messageData = {
        phoneNumber: formattedMobile, // Use the formatted number
        name: data.name,
        username: data.username,
        password: data.password,
      };

      const sendResult = await sendWhatsAppMessage(messageData);

      if (sendResult) {
        return res.status(201).json({
          success: true,
          message: `${message}, and WhatsApp message sent successfully.`,
          user: data,
        });
      } else {
        return res.status(201).json({
          success: false,
          message: `${message}, but unable to send WhatsApp message.`,
          user: data,
        });
      }
    } else {
      return res.status(201).json({ success: false, message: message });
    }
  } catch (error) {
    console.error("Error in createEmployee:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      data: [],
    });
  }
};

// Update Employee Password
export const resestEmployeePassword = async (req, res) => {
  const { employeeId } = req.params;
  const { newPassword, oldPassword } = req.body;
  console.log(req.body);
  if (!newPassword)
    return res.status(400).json({
      message: "Old and new password are required",
      success: false,
      data: [],
    });

  try {
    const { success, message, data } = await Employee.rsesetEmployeePassword(
      employeeId,
      newPassword,
      oldPassword
    );

    res.status(200).json({ success, message, data });
  } catch (error) {
    res.status(500).json({
      data: [],
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

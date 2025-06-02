import User from "../Models/user.js";
import Employee from "../Models/Employee.js";
import { sendSMS } from "../Utils/sendMessage.js";

import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username)
    return res
      .status(400)
      .json({ message: "Username is required", success: false });

  if (!password)
    return res
      .status(400)
      .json({ message: "Password is required", success: false });

  try {
    const userResult = await User.login(username, password);

    if (userResult.success) {
      return res.status(200).json(userResult);
    }

    if (userResult.message === "User not found") {
      const employeeResult = await Employee.login(username, password);
      return res.status(200).json(employeeResult);
    }

    return res.status(401).json(userResult);
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const createSuperAdmin = async (req, res) => {
  const key = req.body.SUPER_KEY;

  if (key !== process.env.SUPER_ADMIN_KEY)
    return res.status(401).json({ message: "Unauthorized" });
  const superUser = await User.createSuperUser();
  res.status(200).json({ message: "Super Admin Created", User: superUser });
};

export const createUser = async (req, res) => {
  const {
    username,
    password,
    name,
    email,
    mobile,
    role,
    companyId,
    sectorId,
    jobTitle,
  } = req.body;

  // Validate required fields
  if (!username || !password || !mobile || !role) {
    return res.status(400).json({
      success: false,
      message: "Username, password, mobile, and role are required fields",
      data: [],
    });
  }

  try {
    const { success, message, data } = await User.createUser({
      username,
      name,
      password,
      email,
      mobile,
      role,
      companyId,
      sectorId,
      jobTitle,
    });

    if (success) {
      // Prepare message data for template
      console.log(
        `It is data:`,
        data,
        `| It is success:`,
        success,
        `| It is message:`,
        message
      );

      const smsMessage = `مرحبًا ${name}، تم إنشاء حسابك بنجاح. اسم المستخدم: ${username}`;
      const smsResponse = await sendSMS(mobile, smsMessage);
      if (smsResponse.success) {
        return res.status(201).json({
          success: true,
          message: `${message} | SMS sent successfully`,
          data,
        });
      } else {
        return res.status(201).json({
          success: false,
          message: `${message} | User created but failed to send SMS`,
          data,
        });
      }
    } else {
      return res.status(201).json({
        success: false,
        message: message,
        data: [],
      });
    }
  } catch (error) {
    console.error("Error in createUser:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while creating user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update Admin Profile (Requires old password)
export const updateAdminProfile = async (req, res) => {
  const { adminId } = req.params;
  const { username, password, email, mobile, oldPassword, newPassword } =
    req.body;
  console.log(req.body);
  if (
    !oldPassword &&
    !username &&
    !password &&
    !email &&
    !mobile &&
    !newPassword
  ) {
    return res.status(400).json({
      message: "Old and new password are required",
      success: false,
      data: [],
    });
  }

  try {
    const { message, data, success } = await User.updateAdminProfile({
      adminId,
      username,
      password,
      email,
      mobile,
      oldPassword,
      newPassword,
    });
    return res.status(200).json({
      message: message,
      success: success,
      data: [],
    });
  } catch (error) {
    return res.status(400).json({
      message: "Error in Upadting",
      success: false,
      data: [],
    });
  }
};

// Reset User Password
export const resetUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { newPassword, oldPassword } = req.body;

  if (!newPassword)
    return res.status(400).json({
      message: "Old and new password are required",
      success: false,
      data: [],
    });

  try {
    const { message, success } = await User.resetUserPassword(
      userId,
      newPassword,
      oldPassword
    );
    return res
      .status(200)
      .json({ message: message, data: [], success: success });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Internal SErver Error", user: null, succes: false });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const { message, success } = await User.deleteUser(userId);
    res.status(200).json({ message, success }); // Send as a single object
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal error",
      success: false,
    });
  }
};

//Get Gov Managers
export const getGovManagers = async (req, res) => {
  try {
    const { success, data } = await User.getAllGovManagers();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to govManagers" });
  }
};

//Get Operating Managers
export const getOpManagers = async (req, res) => {
  try {
    const { success, data } = await User.getAllOpManagers();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getopMangers", succes: false });
  }
};

// Get Kap Employees
export const getKapEmployees = async (req, res) => {
  try {
    const { success, data } = await User.getAllKapEmployees();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getopMangers", succes: false });
  }
};

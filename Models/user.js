import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  name: { type: String, default: "Default User" },
  jobTitle: {
    type: String,
    default: "no-Role",
  },
  password: { type: String, required: true },
  email: { type: String, default: null },
  mobile: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ["admin", "kap_employee", "gov_manager", "op_manager"],
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OpCompany",
    default: null,
  },
  sectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GovSector",
    default: null,
  },
});

// Ensure first-time admin creation
userSchema.statics.createSuperUser = async function () {
  try {
    const existingAdmin = await this.findOne({ role: "admin" });
    if (!existingAdmin) {
      return await this.create({
        username: "admin",
        password: "admin",
        email: "admin@example.com",
        mobile: "0000000000",
        role: "admin",
      });
    }
    return { success: false, message: "Admin already exists" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Generate unique username (not for admin)
userSchema.statics.generateUsername = async function (role, username) {
  try {
    if (role === "admin") throw new Error("Admin must be created manually.");

    const rolePrefixes = {
      kap_employee: "KAP",
      gov_manager: "GOV",
      op_manager: "OPM",
      employee: "EMP",
    };

    const prefix = rolePrefixes[role] || "USR";
    let generatedUsername;

    while (true) {
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase();

      generatedUsername = `${username}${prefix}${randomSuffix}`;

      const existingUser = await this.findOne({ generatedUsername });
      if (!existingUser) break;
    }

    return generatedUsername;
  } catch (error) {
    return { success: false, message: "Error create user " };
  }
};

// Create user
userSchema.statics.createUser = async function (userData) {
  try {
    const existingUser = await this.findOne({ mobile: userData.mobile });
    if (existingUser) {
      return {
        success: false,
        message:
          "Mobile number already exists in the system. Use another number",
        data: [],
      };
    }
    // Check if the username already exists
    const existingUsername = await this.findOne({
      username: userData.username,
    });
    if (existingUsername) {
      return {
        success: false,
        message: "User not created.Username already exists",
        data: [],
      };
    }

    const newUser = await this.create(userData);
    return {
      success: true,
      message: newUser.username + " created Succesfully",
      data: [],
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error while Creating User" };
  }
};

// User login
userSchema.statics.login = async function (username, password) {
  try {
    const user = await this.findOne({ username })
      .populate({
        path: "sectorId",
        select: "govSector  logoImage",
      })
      .populate({
        path: "companyId",
        select: "opCompany  logoImage",
      });

    if (!user) {
      return { success: false, message: "User not found", data: null };
    }
    if (password !== user.password) {
      return { success: false, message: "Invalid Credentials", data: null };
    }

    // Format response based on user role
    const formattedUser = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      mobile: user.mobile,
      name: user.name,
    };

    // Add role-specific fields
    switch (user.role) {
      case "op_manager":
        formattedUser.company = user.companyId
          ? {
              id: user.companyId._id,
              name: user.companyId.opCompany,
              logo: user.companyId.logoImage,
            }
          : null;
        break;
      case "gov_manager":
        formattedUser.sector = user.sectorId
          ? {
              id: user.sectorId._id,
              name: user.sectorId.govSector,
              logo: user.sectorId.logoImage,
            }
          : null;
        break;
      case "kap_employee":
        formattedUser.jobTitle = user.jobTitle;
        break;
    }

    return {
      success: true,
      data: formattedUser,
      message: "Login successful",
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Error while login" };
  }
};

userSchema.statics.updateAdminProfile = async function (data) {
  try {
    const { adminId, username, email, mobile, oldPassword, newPassword } = data;

    const admin = await this.findById(adminId);

    if (!admin) {
      return { success: false, message: "Admin not found", data: [] };
    }

    if (admin.password !== oldPassword) {
      return {
        success: false,
        message: "Current password is incorrect",
        data: [],
      };
    }

    // Update all fields directly
    admin.username = username;
    admin.email = email;
    admin.mobile = mobile;
    admin.password = newPassword;

    const updatedAdmin = await admin.save();
    if (!updatedAdmin) {
      return { success: false, message: "Update failed", data: [] };
    } else {
      return {
        success: true,
        message: "Admin updated successfully",
        data: [],
      };
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: "Update failed", data: [] };
  }
};
// Reset user password
userSchema.statics.resetUserPassword = async function (
  userId,
  newPassword,
  oldPassword = null
) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      return {
        message: "User not found",
        success: false,
        data: [],
      };
    }
    if (user.password !== oldPassword) {
      return {
        message: "Incorrect old Password",
        success: false,
        data: [],
      };
    }

    await this.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    );
    return {
      success: true,
      message: "Password updated successfully",
      data: [],
    };
  } catch (error) {
    return { success: false, message: "Internal Server error", data: [] };
  }
};

// Delete user
userSchema.statics.deleteUser = async function (userId) {
  try {
    const deletedUser = await this.findByIdAndDelete(userId);
    if (!deletedUser) {
      return { success: false, message: "User not found" };
    }

    return {
      success: true,
      message: deletedUser.name + " deleted successfully",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get all government managers
userSchema.statics.getAllGovManagers = async function () {
  try {
    const govManagers = await this.find({ role: "gov_manager" })
      .select("_id username name password mobile ")
      .populate({
        path: "sectorId",
        select: "govSector -_id",
      });

    // Transform the data to include sector name directly
    const formattedManagers = govManagers.map((manager) => ({
      name: manager.name,
      id: manager._id,
      username: manager.username,
      password: manager.password,
      mobile: manager.mobile,
      sector: manager.sectorId?.govSector,
    }));

    return {
      success: true,
      data: formattedManagers,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Error fetching government managers",
      data: [],
    };
  }
};

// Get all KAP employees
userSchema.statics.getAllKapEmployees = async function () {
  try {
    const kapEmployees = await this.find({ role: "kap_employee" }).select(
      "_id name username password mobile jobTitle "
    );

    return {
      success: true,
      data: kapEmployees,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching KAP employees",
    };
  }
};

// Get all operation managers
userSchema.statics.getAllOpManagers = async function () {
  try {
    const opManagers = await this.find({ role: "op_manager" })
      .select("_id username name password mobile ")
      .populate({
        path: "companyId",
        select: "opCompany -_id",
      });

    // Transform the data to include sector name directly
    const formattedManagers = opManagers.map((manager) => ({
      name: manager.name,
      id: manager._id,
      username: manager.username,
      password: manager.password,
      mobile: manager.mobile,
      company: manager.companyId?.opCompany,
    }));

    return {
      success: true,
      data: formattedManagers,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching operation managers",
    };
  }
};

export default mongoose.model("User", userSchema);

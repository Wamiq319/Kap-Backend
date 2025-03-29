import KapCompany from "../Models/kapCompany.js";

export const createKapCompany = async (req, res) => {
  try {
    const { governmentIntegration, adminName, mobile, username, password } =
      req.body;
    console.log(req.body);
    if (
      !governmentIntegration ||
      !adminName ||
      !mobile ||
      !username ||
      !password
    ) {
      console.log(governmentIntegration, adminName, mobile, username, password);
      return res
        .status(400)
        .json({ message: "All fields are required, including the logo image" });
    }

    const { success, data, message } = await KapCompany.createEntity({
      governmentIntegration,
      adminName,
      mobile,
      username,
      password,
      logoImage: "https://www.gstatic.com/webp/gallery/2.sm.jpg", // Store only the URL
    });

    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating company" });
  }
};

export const deleteKapCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { message, success, data } = await KapCompany.deleteEntity(companyId);
    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal error",
      success: false,
      data: [],
    });
  }
};

export const getKapCompaniesNames = async (req, res) => {
  try {
    const { success, data, message } = await KapCompany.getEntitiesNames();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getkapCompnaies" });
  }
};

export const getKapCompanies = async (req, res) => {
  try {
    const { success, data } = await KapCompany.getAllEntities();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getkapCompnaies" });
  }
};

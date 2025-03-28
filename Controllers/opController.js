import OpCompany from "../Models/opCompany.js";

export const createOpCompany = async (req, res) => {
  try {
    const { opCompany, adminName, mobile, username, password } = req.body;

    if (!opCompany || !adminName || !mobile || !username || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required, including the logo image" });
    }

    const { success, data, message } = await OpCompany.createEntity({
      opCompany,
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

export const deleteOpCOmpany = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await OpCompany.deleteCompany(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete OpCOmpany" });
  }
};

export const getCompanyNames = async (req, res) => {
  try {
    const { success, data, message } = await OpCompany.getEntitiesNames();
    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getkapCompnaies" });
  }
};

export const getOpCompanies = async (req, res) => {
  try {
    const { success, data } = await OpCompany.getAllEntities();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getSectors" });
  }
};

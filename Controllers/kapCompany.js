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
    console.log("Ok");

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
    const { id } = req.params;
    const deletedCompany = await KapCompany.deleteCompany(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete kapcompany" });
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

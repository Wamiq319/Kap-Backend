import GovSector from "../Models/governmentSector.js";

export const createGovSector = async (req, res) => {
  try {
    const { govSector, adminName, mobile, username, password } = req.body;
    console.log(req.body);

    if (!govSector || !adminName || !mobile || !username || !password) {
      console.log(govSector, adminName, mobile, username, password);
      return res
        .status(400)
        .json({ message: "All fields are required, including the logo image" });
    }

    const { success, data, message } = await GovSector.createEntity({
      govSector,
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

export const deleteGovSector = async (req, res) => {
  const { managerId } = req.params;

  try {
    const { message, success } = await GovSector.deleteEntity(managerId);
    res.status(200).json({ message, success });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal error",
      success: false,
    });
  }
};

export const getSectorsNames = async (req, res) => {
  try {
    const { success, data, message } = await GovSector.getEntitiesNames();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getSectorNames" });
  }
};

export const getGovSectors = async (req, res) => {
  try {
    const { success, data } = await GovSector.getAllEntities();

    res.status(200).json({ data: data, message: null, success: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getSectors" });
  }
};

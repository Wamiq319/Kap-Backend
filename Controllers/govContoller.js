import GovSector from "../Models/governmentSector.js";
import { uploadLogoImage } from "../Utils/uploadCloudinary.js";

export const createGovSector = async (req, res) => {
  try {
    const { govSector, adminName, mobile, username, password } = req.body;
    const logoImage = req.file;

    const { url: logoUrl, public_id: logoPublicId } = await uploadLogoImage(
      logoImage.path
    );

    if (
      !govSector ||
      !adminName ||
      !mobile ||
      !username ||
      !password ||
      !logoImage
    ) {
      console.log(govSector, adminName, mobile, username, password);
      return res.status(400).json({
        message: "All fields are required, including the logo image",
        data: [],
        success: false,
      });
    }

    const { success, data, message } = await GovSector.createEntity({
      govSector,
      adminName,
      mobile,
      username,
      password,
      logoImage: logoUrl,
    });

    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating company" });
  }
};

export const deleteGovSector = async (req, res) => {
  const { sectorId } = req.params;
  console.log(req.params);

  try {
    const { message, success, data } = await GovSector.deleteEntity(sectorId);
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

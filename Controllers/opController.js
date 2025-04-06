import OpCompany from "../Models/opCompany.js";
import { uploadLogoImage } from "../Utils/uploadCloudinary.js";

export const createOpCompany = async (req, res) => {
  try {
    const { opCompany, adminName, mobile } = req.body;

    const logoImage = req.file;
    const { url: logoUrl, public_id: logoPublicId } = await uploadLogoImage(
      logoImage.path
    );
    if (!opCompany || !adminName || !mobile || !logoImage) {
      return res.status(400).json({
        message: "All fields are required, including the logo image",
        success: false,
        data: [],
      });
    }

    const { success, data, message } = await OpCompany.createEntity({
      opCompany,
      adminName,
      mobile,
      logoPublicId: logoPublicId,
      logoImage: logoUrl,
    });

    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating company" });
  }
};

export const deleteOpCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { message, success, data } = await OpCompany.deleteEntity(companyId);
    res.status(200).json({ message: message, success: success, data: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to delete OpCOmpany",
      success: false,
      data: [],
    });
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

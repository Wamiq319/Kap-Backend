import KapCompany from "../Models/kapCompany.js";

import { uploadToCloudinary } from "../Utils/uploadCloudinary.js";

// 🔹 Create a New KAP Company with Cloudinary Image Upload

export const createKapCompany = async (req, res) => {
  try {
    const { governmentIntegration, adminName, mobile, username, password } =
      req.body;

    if (
      !governmentIntegration ||
      !adminName ||
      !mobile ||
      !username ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required, including the logo image" });
    }

    // // Upload image from `public/temp`
    // const uploadedImageUrl = await uploadToCloudinary(req.file.path);

    // Save company details in database
    const newCompany = await KapCompany.createCompany({
      governmentIntegration,
      adminName,
      mobile,
      username,
      password,
      logoImage: "https://www.gstatic.com/webp/gallery/2.sm.jpg", // Store only the URL
    });

    res.status(201).json({
      message: "Company created successfully",
      company: newCompany.data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error creating company" });
  }
};

// 🔹 Update KAP Company
export const updateKapCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    if (!id) return res.status(400).json({ message: "Company ID is required" });

    // Remove empty fields so they don't overwrite existing data
    Object.keys(formData).forEach(
      (key) => formData[key] === "" && delete formData[key]
    );

    const updatedCompany = await KapCompany.findByIdAndUpdate(
      id,
      { $set: formData },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update company", error: error.message });
  }
};

// 🔹 Delete KAP Company
export const deleteKapCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await KapCompany.deleteCompany(id);

    if (!deletedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete company" });
  }
};

// 🔹 Delete KAP Company
export const getKapCompanies = async (req, res) => {
  try {
    const kapCompanies = await KapCompany.getAllCompanies();

    if (!kapCompanies) {
      return res.status(404).json({ message: "No  Companies to show" });
    }

    res.status(200).json(kapCompanies);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to getCompnaies" });
  }
};

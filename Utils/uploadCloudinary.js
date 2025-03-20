import cloudinary from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// 🔹 Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload file to Cloudinary & delete temp file
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: "kap_companies",
    });

    // Delete the file from temp folder after upload
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    // Delete file if upload fails
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(error.message || "Cloudinary upload failed");
  }
};

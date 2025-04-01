import { uploadFile } from "../middleware/upload.js";
import { uploadToCloudinary, getResourceType } from "../utils/cloudinary.js";

// Example for image upload
export const uploadImage = async (req, res) => {
  try {
    const uploadMiddleware = uploadFile("image");

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await uploadToCloudinary(
        req.file.path,
        "images",
        getResourceType(req.file.mimetype)
      );

      res.json({
        success: true,
        data: {
          url: result.url,
          type: result.resource_type,
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during upload",
    });
  }
};

// Example for PDF/document upload
export const uploadDocument = async (req, res) => {
  try {
    const uploadMiddleware = uploadFile("document");

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await uploadToCloudinary(
        req.file.path,
        "documents",
        "raw" // Force as raw for PDFs
      );

      res.json({
        success: true,
        data: {
          url: result.url,
          download_url: `${result.url}?dl=1`, // Add download parameter
          type: "document",
        },
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during upload",
    });
  }
};

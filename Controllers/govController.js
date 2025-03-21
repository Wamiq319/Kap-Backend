import GovSector from "../Models/govSector.js";

// 🔹 Create a New Government Sector with Cloudinary Image Upload
export const createGovSector = async (req, res) => {
  try {
    const { governmentSector, adminName, mobile, username, password } =
      req.body;

    if (!governmentSector || !adminName || !mobile || !username || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required, including the logo image" });
    }

    // // Upload image from `public/temp`
    // const uploadedImageUrl = await uploadToCloudinary(req.file.path);

    // Save company details in database
    await GovSector.createSector({
      governmentSector,
      adminName,
      mobile,
      username,
      password,
      logoImage: "https://www.gstatic.com/webp/gallery/2.sm.jpg", // Store only the URL
    });

    res.status(201).json({
      message: "Sector created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internall server error" });
  }
};

import mongoose from "mongoose";

const kapCompanySchema = new mongoose.Schema({
  governmentIntegration: { type: String, required: true },
  logoImage: { type: String, required: true }, // Cloudinary URL
  adminName: { type: String, required: true },
  mobile: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

kapCompanySchema.statics.createCompany = async function (companyData) {
  try {
    const newCompany = await this.create(companyData);
    return { message: "Company created successfully" };
  } catch (error) {
    throw new Error(error.message || "Error creating company");
  }
};

kapCompanySchema.statics.getAllCompanies = async function () {
  return await this.find({}).select("-__v");
};

kapCompanySchema.statics.deleteCompany = async function (id) {
  return await this.findByIdAndDelete(id);
};

kapCompanySchema.statics.updateCompany = async function (id, updateData) {
  return await this.findByIdAndUpdate(id, updateData, { new: true });
};

export default mongoose.model("KapCompany", kapCompanySchema);

import mongoose from "mongoose";

const govSectorSchema = new mongoose.Schema({
  governmentSector: { type: String, required: true },
  logoImage: { type: String, required: true },
  adminName: { type: String, required: true },
  mobile: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

govSectorSchema.statics.createSector = async function (sectorData) {
  try {
    sector = await this.create(sectorData);
    console.log(sector);
    return { message: "Company created successfully" };
  } catch (error) {
    throw new Error(error.message || "Error creating company");
  }
};

export default mongoose.model("GovSector", govSectorSchema);

import mongoose from "mongoose";

const opCompanySchema = new mongoose.Schema(
  {
    opCompany: { type: String, required: true },
    logoImage: { type: String, required: true }, // Cloudinary URL
    adminName: { type: String, required: true },
    mobile: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { versionKey: false }
);

// Create a new Company Entity
opCompanySchema.statics.createEntity = async function (entityData) {
  try {
    const newEntity = await this.create(entityData);
    if (newEntity) {
      return {
        success: true,
        message: "Company Created Succesfully",
        data: [],
      };
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error creating Company", data: null };
  }
};

// Delete a Company Entity
opCompanySchema.statics.deleteEntity = async function (EntityId) {
  try {
    const deletedEntity = await this.findByIdAndDelete(EntityId);
    if (!deletedEntity) throw new Error("Company Entity not found");
    return { success: true, message: "Company Entity deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get all Company Entitys with their IDs and names
opCompanySchema.statics.getEntitiesNames = async function () {
  try {
    const Entities = await this.find({}, "_id opCompany");
    console.log(Entities);
    return {
      success: true,
      data: Entities.map(({ _id, opCompany }) => ({
        id: _id,
        companyName: opCompany,
      })),
      message: null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error while fetching opCompany names",
      data: [],
    };
  }
};

opCompanySchema.statics.getAllEntities = async function () {
  try {
    const Entities = await this.find({});

    return {
      success: true,
      data: Entities,
      message: null,
    };
  } catch (error) {
    return { success: false, message: "Error while fetching Companies" };
  }
};

export default mongoose.model("OpCompany", opCompanySchema);

import mongoose from "mongoose";

const kapCompanySchema = new mongoose.Schema(
  {
    governmentIntegration: { type: String, required: true },
    logoImage: { type: String, required: true }, // Cloudinary URL
    adminName: { type: String, required: true },
    mobile: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { versionKey: false }
);

// Create a new Company Entity
kapCompanySchema.statics.createEntity = async function (entityData) {
  try {
    console.log(entityData);
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
    return { success: false, message: "Error creating Company", data: [] };
  }
};

// Delete a Company Entity
kapCompanySchema.statics.deleteEntity = async function (EntityId) {
  try {
    console.log(EntityId);
    const deletedEntity = await this.findByIdAndDelete(EntityId);
    if (!deletedEntity) {
      return { success: false, message: "Company not found", data: [] };
    }
    return {
      data: [],
      success: true,
      message: deletedEntity.governmentIntegration + "+ deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "internal error", data: [] };
  }
};

// Get all Company Entitys with their IDs and names
kapCompanySchema.statics.getEntitiesNames = async function () {
  try {
    const Entities = await this.find({}, "_id name");
    return {
      success: true,
      data: Entities.map(({ _id, name }) => ({ id: _id, name })),
    };
  } catch (error) {
    return { success: false, message: "Error while fetching company names" };
  }
};

kapCompanySchema.statics.getAllEntities = async function () {
  try {
    // Fetch all company data (complete entities)
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

export default mongoose.model("KapCompany", kapCompanySchema);

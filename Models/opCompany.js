import mongoose from "mongoose";

const opCompanySchema = new mongoose.Schema(
  {
    opCompany: { type: String, required: true },
    logoImage: { type: String, required: true }, // Cloudinary URL
    logoPublicId: { type: String, required: true }, // Cloudinary Public ID
    adminName: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  { versionKey: false }
);

// Create a new Company Entity
opCompanySchema.statics.createEntity = async function (entityData) {
  try {
    const existingEntity = await this.findOne({ mobile: entityData.mobile });
    if (existingEntity) {
      return {
        success: false,
        message:
          "Mobile number already exists in the system. Use another number",
        data: [],
      };
    }
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
  console.log(EntityId);
  try {
    const deletedEntity = await this.findByIdAndDelete(EntityId);
    if (!deletedEntity) {
      return { success: false, message: "Company not found", data: [] };
    }
    return {
      success: true,
      message: deletedEntity.opCompany + " deleted successfully",
      data: [],
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", data: [] };
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

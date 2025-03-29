import mongoose from "mongoose";

const govSectorSchema = new mongoose.Schema(
  {
    govSector: { type: String, required: true },
    logoImage: { type: String, required: true }, // Cloudinary URL
    adminName: { type: String, required: true },
    mobile: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { versionKey: false }
);

// Create a new Company Entity
govSectorSchema.statics.createEntity = async function (entityData) {
  try {
    const newEntity = await this.create(entityData);
    if (newEntity) {
      return {
        success: true,
        message: "Gov Sector Created Succesfully",
        data: null,
      };
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error creating GovSector", data: null };
  }
};

// Delete a Company Entity
govSectorSchema.statics.deleteEntity = async function (EntityId) {
  try {
    
    const deletedEntity = await this.findByIdAndDelete(EntityId);
    if (!deletedEntity) {
      return { success: false, message: "Sector not found" };
    }
    return {
      success: true,
      message: deletedEntity.govSector + " deleted successfully",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get all Company Entitys with their IDs and names
govSectorSchema.statics.getEntitiesNames = async function () {
  try {
    const Entities = await this.find({}, "_id govSector");
    return {
      success: true,
      data: Entities.map(({ _id, govSector }) => ({
        id: _id,
        sectorName: govSector,
      })),
      message: null,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error while fetching govSector names",
      data: [],
    };
  }
};

govSectorSchema.statics.getAllEntities = async function () {
  try {
    // Fetch all company data (complete entities)
    const Entities = await this.find({});

    return {
      success: true,
      data: Entities,
      message: null,
    };
  } catch (error) {
    return { success: false, message: "Error while fetching govSectors" };
  }
};

export default mongoose.model("GovSector", govSectorSchema);

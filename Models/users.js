import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "manager", "employee"],
    required: true,
  },
});

userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });
  if (!user) throw new Error("User does not exist");

  if (user.password !== password) {
    throw new Error("Invalid Password");
  }

  return user;
};

userSchema.statics.createSuperUser = async function (username, password, role) {
  try {
    const existingUser = await this.findOne({ username });
    if (existingUser) {
      return { message: "Username already taken", data: null };
    }

    const newUser = await this.create({ username, password, role });

    return {
      message: "User created successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        password: password,
      },
    };
  } catch (error) {
    return { message: "Error creating user", data: null, error: error.message };
  }
};

export default mongoose.model("User", userSchema);

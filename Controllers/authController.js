import User from "../Models/users.js";

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username)
    return res.status(400).json({ message: "Username is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    // Call model function to validate user
    const user = await User.login(username, password);

    // Destroy old session for security
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Try again" });
      }

      // Store user session
      req.session.user = {
        id: user._id,
        username: user.username,
        role: user.role,
      };

      res
        .status(200)
        .json({ message: "Login successful", user: req.session.user });
    });
  } catch (error) {
    res.status(401).json({ message: "Internal server errorr" });
  }
};

// TODO:REMOVE THIS CODE ONCE DEVELOPMENT IS DONE
export const createSuperUser = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const { message, data } = await User.createSuperUser(
      username,
      password,
      role
    );

    res.status(200).json({ message: message, user: data });
  } catch (error) {
    res.status(500).json({ message: "Error occurred", error: error.message });
  }
};

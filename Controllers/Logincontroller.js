const User = require("../models/User");
const mongoose = require("mongoose")
const ConnectionData = require("../models/Connection");

//resister User
exports.registerUser = async (req, res) => {
  try {
    const { Email } = req.body;


    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
};
//login user
exports.loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const user = await User.findOne({ Email });

    if (!user || user.Password !== Password) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Invalid credentials",
        user: ""
      });
    }

    return res.status(200).json({
      message: "Login successful",
      success: true,
      error: false,
      user: { id: user._id, Name: user.Name, Email: user.Email },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Login Failed",
      success: false,
      error: true,
      user: ""
    });
  }
};
//resetPassword controlle
exports.ResetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { oldPassword, newPassword } = req.body;
    if (user.Password !== oldPassword) {
      return res.status(400).json({ message: "Invalid old password" });
    }
    user.Password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset password is not working", error: err.message });
  }
};
//get All User
// exports.getAllUsers = async (req, res) => {
//   const UserId = req.query.userId;
//   const objectIdUserId = new mongoose.Types.ObjectId(UserId); // Convert to ObjectId

//   const users = await User.find({ _id: { $ne: objectIdUserId } }, "Name");
//   res.status(200).json({ users });
// };


//new get All User
exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.query.userId; 

    console.log(userId); // Logged-in user ID

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Fetch user's connections (friends + pending requests)
    const connections = await ConnectionData.find({
      $or: [{ senderId: objectIdUserId }, { receiverId: objectIdUserId }]
    });

    // Extract friend IDs (both sender & receiver except current user)
    const friendIds = [];
    const sentRequests = [];
    const receivedRequests = [];

    connections.forEach(conn => {
      if (conn.status === "accepted") {
        friendIds.push(conn.senderId.toString() === userId ? conn.receiverId.toString() : conn.senderId.toString());
      } else if (conn.status === "pending") {
        if (conn.senderId.toString() === userId) {
          sentRequests.push(conn.receiverId.toString()); // Request sent by me
        } else {
          receivedRequests.push(conn.senderId.toString()); // Request received
        }
      }
    });

    // Fetch all users except logged-in user, friends, and pending requests
    const users = await User.find({
      _id: { $nin: [...friendIds, objectIdUserId] } // Exclude accepted friends
    }).select("_id Name Email");

    return res.status(200).json({
      message: "Users retrieved successfully",
      users,
      sentRequests,
      receivedRequests
    });

  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

//get User by id 
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  user ? res.status(200).json(user) : res.status(404).json({ message: "User not found" });
};
//delete user
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User deleted" });
};
//update User
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Update user & return updated data
    const updatedUser = await User.findByIdAndUpdate(userId, {
      _id: req.body.id,
      Name: req.body.name,
      Email: req.body.email,
      Password: req.body.password
    }, {
      new: true, 
      runValidators: true 
    });

    console.log("Updated User:", updatedUser); 

    res.status(200).json({ success: true, updatedUser });

  } catch (error) {
    console.error("Error updating user:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message, 
    });
  }
};

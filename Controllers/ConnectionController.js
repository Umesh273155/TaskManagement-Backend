const Connection = require("../models/Connection");
const User = require("../models/User");
const mongoose = require('mongoose');

exports.createConnection = async (req, res) => {
  try {
    const { senderId, receiverId} = req.body;

    // Prevent duplicate friend requests
    const existingRequest = await Connection.findOne({ senderId, receiverId });
    if (existingRequest) return res.status(400).json({ message: "Request already sent" });

    // Create new connection request
    await Connection.create({ senderId, receiverId, status: "pending" });

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Create Connection failed", error: err.message });
  }
};

exports.getConnection = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Fetch connections
    const data = await Connection.aggregate([
      {
        $match: {
          $or: [{ senderId: objectIdUserId }, { receiverId: objectIdUserId }]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $project: {
          _id: 1,
          sender: { $arrayElemAt: ["$sender", 0] },
          receiver: { $arrayElemAt: ["$receiver", 0] },
          status: 1,
          createdAt: 1,
        },
      },
    ]);

    // Separate connections
    // const friends = data.filter(conn => conn.status === "accepted");
    const friends = data.filter(conn => conn.status === "accepted").map(conn => ({
      ...conn,
      status: "friend"  // Ensuring accepted friends are always marked correctly
    }));
    

    // Requests sent by the user
    const sentRequests = data.filter(conn => conn.sender?._id.toString() === userId && conn.status === "pending");

    // Requests received by the user
    const receivedRequests = data.filter(conn => conn.receiver?._id.toString() === userId && conn.status === "pending");

    // Fetch all users except the current user
    const users = await User.find({ _id: { $ne: objectIdUserId } }).select("_id Name Email");

    return res.status(200).json({
      message: "Connections retrieved successfully",
      friends,
      sentRequests,
      receivedRequests,
      users
    });

  } catch (err) {
    console.error("Error fetching connections:", err);
    res.status(500).json({ message: "Failed to fetch connections", error: err.message });
  }
};


exports.updateConnection = async (req, res) => { 
  try {
    const { status } = req.body;
    const connectionId = req.params.id; 
   

    if (!connectionId || !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const updatedData = await Connection.findByIdAndUpdate(
      connectionId,
      { status },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Connection not found" });
    }

    return res.status(200).json({ message: "Connection updated successfully", data: updatedData });
  } catch (err) {
    console.error("Error updating connection:", err);
    res.status(500).json({ message: "Failed to update connection", error: err.message });
  }
};


exports.deleteConnection = async (req, res) => {
  try {
    
    const connectionId = req.params.id;  // Ensure it's the connection ID
    console.log("its recieve dalet id ",connectionId)
    if (!connectionId) {
      return res.status(400).json({ message: "Connection ID is required" });
    }

    const deletedData = await Connection.findByIdAndDelete(connectionId);

    if (!deletedData) {
      return res.status(404).json({ message: "Connection not found" });
    }

    return res.status(200).json({ message: "Successfully removed from friends list" });
  } catch (err) {
    console.error("Error deleting connection:", err);
    res.status(500).json({ message: "Failed to remove friend", error: err.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("its send Request Id ", userId)

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // Fetch only pending requests sent by the user
    const sentRequests = await Connection.aggregate([
      {
        $match: { senderId: objectIdUserId, status: "pending" },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $project: {
          _id: 1,
          receiver: { $arrayElemAt: ["$receiver", 0] },
          status: 1,
          createdAt: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Sent friend requests retrieved successfully",
      sentRequests,
    });

  } catch (err) {
    console.error("Error fetching sent friend requests:", err);
    res.status(500).json({ message: "Failed to fetch sent requests", error: err.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    const friends = await Connection.aggregate([
      {
        $match: {
          $or: [
            { senderId: objectIdUserId, status: { $in: ["accepted", "friend"] } },
            { receiverId: objectIdUserId, status: { $in: ["accepted", "friend"] } }
          ]
        }
      },
      {
        $lookup: {
          from: "users",
          let: { friendId: { $cond: [{ $eq: ["$senderId", objectIdUserId] }, "$receiverId", "$senderId"] } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$friendId"] } } },
            { $project: { _id: 1, Name: 1, Email: 1, profilePicture: 1 } } // Select only required fields
          ],
          as: "friendData"
        }
      },
      { $unwind: "$friendData" },
      {
        $project: {
          friend: "$friendData" // Removes unnecessary fields like status and createdAt
        }
      }
    ]);

    res.status(200).json({ message: "Friends retrieved successfully", friends });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch friends", error: err.message });
  }
};




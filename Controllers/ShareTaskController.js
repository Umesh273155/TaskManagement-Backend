const ShareTask = require("../models/ShareTask.js");

exports.createShareTask = async (req, res) => {
    try {
        const { senderId, receiverId, taskId, Permission } = req.body;

        await ShareTask.create({
            senderId,
            receiverId,
            taskId, // ✅ Fixed field name
            Permission, 
        });

        res.status(200).json({ message: "ShareTask created successfully" });
    } catch (err) {
        console.error("Error creating share task:", err);
        res.status(500).json({ message: "Failed to create the Task" });
    }
};

exports.getSharedFriends = async (req, res) => {
    try {
        const { taskId } = req.query; // ✅ Changed from req.query to req.params
        if (!taskId) {
            return res.status(400).json({ message: "Task ID is required" });
        }

        const sharedFriends = await ShareTask.find({ taskId }) // ✅ Fixed field name
            .populate("receiverId", "Name")
            .select("receiverId Permission");

        res.status(200).json(sharedFriends);
    } catch (err) {
        console.error("Error retrieving shared friends:", err);
        res.status(500).json({ message: "Failed to retrieve shared friends" });
    }
};

exports.removeSharedFriend = async (req, res) => {
    try {
        const { shareId } = req.params; // ✅ Use req.params instead of req.body

        if (!shareId) {
            return res.status(400).json({ message: "Share ID is required" });
        }

        const deletedEntry = await ShareTask.findByIdAndDelete(shareId);

        if (!deletedEntry) {
            return res.status(404).json({ message: "Friend not found in shared list" });
        }

        res.status(200).json({ message: "Friend removed from shared list" });
    } catch (err) {
        console.error("Error removing shared friend:", err);
        res.status(500).json({ message: "Failed to remove shared friend" });
    }
};

exports.updateSharedFriendPermission = async (req, res) => {
    try {
        const { friendId } = req.params;
        const { newPermission } = req.body;
        

        if (!friendId || !newPermission) {
            return res.status(400).json({ message: "Share ID and New Permission are required" });
        }

        const updatedEntry = await ShareTask.findByIdAndUpdate(
            friendId,
            { Permission: newPermission },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ message: "Friend not found in shared list" });
        }

        res.status(200).json({ message: "Permission updated successfully", updatedEntry });
    } catch (err) {
        console.error("Error updating permission:", err);
        res.status(500).json({ message: "Failed to update permission" });
    }
};

const express = require("express");
const router = express.Router();
const { 
    createShareTask,  
    removeSharedFriend, 
    updateSharedFriendPermission, 
    getSharedFriends 
} = require("../Controllers/ShareTaskController");

// Share a task
router.post("/shareTask", createShareTask); 

// Get shared friends (taskId should be in params, not query)
router.get("/getShareTask", getSharedFriends); 
// Remove a shared task
router.delete("/removeSharedTask/:shareId", removeSharedFriend); 

// Update permission of shared task
router.patch("/updateSharedTaskPermission/:friendId", updateSharedFriendPermission); 

module.exports = router;

const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,  
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,  
    },
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tasks",
        required: true,
    },
    Permission: {
        type: String, 
        enum: ["edit", "View","comment"],
        required: true,  
    },
    createdAt: { type: Date, default: Date.now },  
}
);

const ShareTask = mongoose.model("ShareTaskData", ShareSchema);
module.exports = ShareTask;

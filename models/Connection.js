const mongoose = require("mongoose")

const ConnectionSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected","friend"],
        default: "pending"
    },
    createdAt: { type: Date, default: Date.now },
})

const Connection = mongoose.model("ConnectionData",ConnectionSchema)
module.exports = Connection;

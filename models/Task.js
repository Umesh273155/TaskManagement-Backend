const mongoose = require('mongoose')
const taskSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    CategoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Categorydata',
        required:true

    },
    Task: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'], 
        default: 'Pending'
    },
}, {timestamps:true});
const Tasks = mongoose.model("taskdata", taskSchema)
module.exports = Tasks;
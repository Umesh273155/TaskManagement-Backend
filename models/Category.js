const mongoose = require('mongoose')
const CategoryShema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Category:{
        type:String,
        required:true
    },
    Status:{
        type: String,
        required:true
    }
}, {timestamps:true});
const Categorys = mongoose.model("Categorydata",CategoryShema)
module.exports = Categorys;



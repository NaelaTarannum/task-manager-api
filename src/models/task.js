const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim:true
    },
    coompleted: {
        type: Boolean,
        default: false
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'

    }
},{
    timestamps:true
})
const Tasks = mongoose.model('Tasks',taskSchema);

module.exports = Tasks;
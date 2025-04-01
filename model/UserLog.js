const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserLogSchema = new Schema({
    id: {
        type: Number,
        required: false
    },
    userName: {
        type: String,
        required: true
    },
    activity: {
        type: String,
        required: true
    },
    activity_date: {
        type: Date,
        default: Date.now
    },
    other_details: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('UserLog', UserLogSchema);

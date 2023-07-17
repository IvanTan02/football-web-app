const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reqDateSchema = new Schema({
    lastPLTeamsReq: {
        type: Date,
        required: true
    }
});

const LastReqDates = mongoose.model('LastReqDates', reqDateSchema);

module.exports = LastReqDates;
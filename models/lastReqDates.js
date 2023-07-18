const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reqDateSchema = new Schema({
    lastPLTeamsReq: {
        type: Date,
    },
    lastStandingReq: {
        type: Date
    }
});

const LastReqDates = mongoose.model('LastReqDates', reqDateSchema);

module.exports = LastReqDates;
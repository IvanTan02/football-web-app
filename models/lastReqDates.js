const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reqDateSchema = new Schema({
    lastTeamsReq: {
        type: Date,
    },
    lastStandingReq: {
        type: Date
    },
    lastCoachReq: {
        type: Date
    },
    lastSquadReq: {
        type: Date
    }
});

const LastReqDates = mongoose.model('LastReqDates', reqDateSchema);

module.exports = LastReqDates;
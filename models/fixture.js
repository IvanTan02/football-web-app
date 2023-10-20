
const moment = require("moment-timezone");

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixtureSchema = new Schema({
    id: Number,
    date: String,
    timestamp: Number,
    venue: {
        name: String,
        city: String
    },
    status: {
        long: String,
        short: String,
        elapsed: Number
    },
    league: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    round: String,
    teams: {
        home: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },
        away: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        }
    },
    goals: {
        home: Number,
        away: Number
    }
});

fixtureSchema.virtual('formattedDate').get(function () {
    if (!this.date) return null;
    const localMomentTime = moment.tz(this.date, 'Asia/Kuala_Lumpur');
    return {
        matchDate: localMomentTime.format("D MMM YYYY"),
        matchTime: localMomentTime.format("hh:mm A")
    };
})

const Fixture = mongoose.model('Fixture', fixtureSchema);

module.exports = Fixture;
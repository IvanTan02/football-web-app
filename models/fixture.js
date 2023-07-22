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

const Fixture = mongoose.model('Fixture', fixtureSchema);

module.exports = Fixture;
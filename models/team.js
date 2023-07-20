const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    id: Number,
    name: String,
    logo: String,
    code: String,
    country: String,
    flag: String,
    founded: Number,
    league: {
        type: Schema.Types.ObjectId,
        ref: 'League'
    },
    venue: {
        name: String,
        address: String,
        city: String,
        capacity: Number,
        image: String
    },
    coach: {
        type: Schema.Types.ObjectId,
        ref: 'Coach'
    },
    squad: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Player'
        }
    ]
})

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
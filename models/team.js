const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new mongoose.Schema({
    team: {
        id: Number,
        name: String,
        logo: String,
        code: String,
        country: String,
        founded: Number,
    },
    venue: {
        name: String,
        address: String,
        city: String,
        capacity: Number,
        image: String
    },
    coach: {
        firstname: String,
        lastname: String,
        age: Number,
        nationality: String,
        height: String,
        weight: String,
        photo: String
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
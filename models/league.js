const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leagueSchema = new Schema({
    name: String,
    country: String,
    logo: String,
    flag: String,
    standings: [
        [
            {
                rank: Number,
                team: {
                    type: Schema.Types.ObjectId,
                    ref: 'Team'
                },
                points: Number,
                goalDiff: Number,
                all: {
                    played: Number,
                    win: Number,
                    draw: Number,
                    lose: Number,
                    goals: {
                        for: Number,
                        against: Number
                    }
                }
            }
        ]
    ]
})

const League = mongoose.model('League', leagueSchema);

module.exports = League;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coachSchema = new Schema({
    id: Number,
    name: String,
    firstname: String,
    lastname: String,
    age: Number,
    height: String,
    weight: String,
    nationality: String,
    photo: String,
    birth: {
        date: String,
        place: String,
        country: String
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    career: [
        {
            _id: false,
            team: {
                id: Number,
                name: String,
            },
            start: String,
            end: String
        }
    ]
}, { timestamps: false });

const Coach = mongoose.model('Coach', coachSchema);

module.exports = Coach;

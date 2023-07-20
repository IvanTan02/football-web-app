const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coachSchema = new Schema({
    firstname: String,
    lastname: String,
    age: Number,
    nationality: String,
    photo: String,
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    }
});

const Coach = mongoose.model('Coach', coachSchema);

module.exports = Coach;

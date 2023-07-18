const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
    id: Number,
    name: String,
    age: Number,
    number: Number,
    position: String,
    photo: String
})

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
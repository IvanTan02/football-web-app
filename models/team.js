const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: String,
    logo: String,
    code: String,
    country: String,
    founded: Number
})

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
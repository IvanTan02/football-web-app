if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const moment = require('moment');

const League = require('../models/league');
const Fixture = require('../models/fixture');
const { getCurrentRound, addNewFixtures } = require('../utilities/api/fixtureHelper');

module.exports.renderHomePage = async (req, res) => {

    const league = await League.findOne({}).populate('standings.team');
    const currentRound = await getCurrentRound();
    const fixtures = await Fixture.find({ 'round': `Regular Season - ${currentRound}` })
        .populate('teams.home')
        .populate('teams.away')
        .populate('goals')
    for (let f of fixtures) {
        f.matchDate = moment(f.date).format('D MMMM YYYY')
        f.matchTime = moment(f.date).format('hh:mm A')
    }
    res.render('home', { league, fixtures });
}


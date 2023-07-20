if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const League = require('../models/league');
const { requestStandings } = require('../utilities/api/leagueHelpers');

module.exports.renderHomePage = async (req, res) => {
    // await requestStandings();
    const league = await League.findOne({}).populate('standings.team');
    res.render('home', { league });
}

const mongoose = require('mongoose');

const { requestPLTeams, requestCoach, requestSquad } = require('../utilities/api/teamHelpers');
const { requestStandings } = require('../utilities/api/leagueHelpers');
const { addNewFixtures } = require('../utilities/api/fixtureHelper');
const Team = require('../models/team');

const dbUrl = 'mongodb://0.0.0.0:27017/football-app'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database connected.')
})

const seed = async () => {
    // await requestPLTeams();
    // const seedTeam = await Team.findOne({ 'name': 'Manchester United' });
    // if (seedTeam) {
    //     console.log('Requesting coach and squad....')
    //     await requestCoach(seedTeam);
    //     await requestSquad(seedTeam);
    // }
    // console.log('Requsting league standings....')
    // await requestStandings();
    // console.log('Requsting league fixtures....')
    // await addNewFixtures(1);
}

seed().then(() => {
    mongoose.connection.close();
})

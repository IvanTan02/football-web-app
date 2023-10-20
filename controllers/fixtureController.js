
const moment = require("moment-timezone");

const { updateFixtures } = require('../utilities/api/fixtureHelper');
const { makeScheduledFixtureCall } = require('../utilities/api/reqScheduler');
const { compareStartTimes } = require('../controllers/leagueController')

const Fixture = require('../models/fixture');

module.exports.renderFixturesPage = async (req, res) => {
    res.render('fixture')
}

module.exports.updateFixtures = async (req, res) => {
    if (!req.body) {
        const message = await updateFixtures();
        res.send(message);
    }
    const { matchweek } = req.body;
    const message = await updateFixtures(matchweek);
    res.send(message);
}

module.exports.makeScheduledAPICall = async (req, res) => {
    const { startTime } = req.params;
    const response = await makeScheduledFixtureCall(startTime);
    const { statusCode, message } = response;
    res.status(statusCode).send(message);
}

module.exports.getFixtureByMatchweek = async (req, res) => {
    const { matchweek } = req.params;
    console.log(matchweek)
    const fixturesThatWeek = await Fixture.find({ round: `Regular Season - ${matchweek}` })
        .populate("teams.home")
        .populate("teams.away")
        .populate("goals");

    fixturesThatWeek.sort(compareStartTimes)
    let newFixtures = [];

    for (let fixture of fixturesThatWeek) {
        const newFixture = fixture.toObject();
        newFixture.formattedDate = fixture.formattedDate;
        newFixtures.push(newFixture);
    }
    res.json(newFixtures);
}

const assignDateTime = (fixtures) => {
    const assignedFixtures = [];
    for (let f of fixtures) {
        const localMomentTime = moment.tz(f.date, 'Asia/Kuala_Lumpur');
        f.matchDate = localMomentTime.format("D MMM YYYY");
        f.matchTime = localMomentTime.format("hh:mm A");
        assignedFixtures.push(f);
        console.log(f)
    }
}
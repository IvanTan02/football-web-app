const { updateFixtures } = require('../utilities/api/fixtureHelper');
const { makeScheduledFixtureCall } = require('../utilities/api/reqScheduler');

module.exports.renderFixturesPage = async (req, res) => {
    res.render('fixture')
}

module.exports.updateFixtures = async (req, res) => {
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
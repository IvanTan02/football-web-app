const { updateFixtures } = require('../utilities/api/fixtureHelper')

module.exports.renderFixturesPage = async (req, res) => {
    res.render('fixture')
}

module.exports.updateFixtures = async (req, res) => {
    const { matchweek } = req.body;
    const message = await updateFixtures(matchweek);
    res.send(message);
}
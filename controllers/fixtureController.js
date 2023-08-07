const Fixture = require("../models/fixture");
const { updateFixtures } = require('../utilities/api/fixtureHelper')

module.exports.updateFixtures = async (req, res) => {
    const { matchweek } = req.body;
    const message = await updateFixtures(matchweek);
    res.send(message);
}
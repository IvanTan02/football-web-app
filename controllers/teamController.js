const Team = require('../models/team');

const { requestPLTeams, requestCoach, requestSquad } = require('../utilities/api/teamHelpers');

module.exports.teamsIndex = async (req, res) => {
    // await requestPLTeams();
    const teams = await Team.find({});
    res.render('teams/index', { teams });
}

module.exports.showTeam = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findById(id).populate('league').populate('coach').populate('squad');
    await requestCoach(team);
    // await requestSquad(team);
    res.render('teams/details', { team })
}
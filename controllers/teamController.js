const Team = require('../models/team');

const { requestPLTeams, requestCoach, requestSquad } = require('../utilities/api/teamHelpers');

module.exports.teamsIndex = async (req, res) => {
    // await requestPLTeams();
    const teams = await Team.find({});

    teams.sort((a, b) => {
        const teamA = a.name.toLowerCase();
        const teamB = b.name.toLowerCase();

        if (teamA < teamB) return -1;
        if (teamA > teamB) return 1;
        return 0;
    })
    req.flash('error', 'Damnn sonn')
    // res.render('teams/index', { teams });
    res.redirect('/register')
}

module.exports.showTeam = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findById(id).populate('league').populate('coaches').populate('squad');
    // await requestCoach(team);
    // await requestSquad(team);
    res.render('teams/details', { team })
}



const haiz = async () => {
    await Team.updateMany({}, { $unset: { fixtures: 1 } });
}
const Team = require('../models/team');

const { requestCoach, requestSquad } = require('../utilities/api/teamHelpers');

module.exports.renderTeamsIndex = async (req, res) => {
    const teams = await Team.find({});

    teams.sort((a, b) => {
        const teamA = a.name.toLowerCase();
        const teamB = b.name.toLowerCase();

        if (teamA < teamB) return -1;
        if (teamA > teamB) return 1;
        return 0;
    })
    res.render('teams/index', { teams });
}

module.exports.renderTeamDetails = async (req, res) => {
    const { id } = req.params;
    const team = await Team.findById(id).populate('league').populate('coaches').populate('squad');
    res.render('teams/details', { team })
}

module.exports.updateTeams = async (req, res) => {
    const { teamId, updateOption } = req.body;

    if (teamId) {
        // UPDATE SPECIFIC TEAM
        if (updateOption === 'Coaches') {
            const team = await Team.findById(teamId).populate('coaches');
            if (team) {
                const message = await requestCoach(team)
                res.send(message);
            } else {
                res.send('There was a problem finding this team');
            }
        }
        if (updateOption === 'Squad') {
            const team = await Team.findById(teamId).populate('squad');
            if (team) {
                const message = await requestSquad(team)
                res.send(message)
            } else {
                res.send('There was a problem finding this team');
            }
        }
    } else {
        // UPDATE ALL TEAMS
        if (updateOption === 'Coaches') {
            const teams = await Team.find({}).populate('coaches');
            for (const team of teams) {
                await requestCoach(team);
            }
            res.send('All coaches updated successfully');
        }
        if (updateOption === 'Squad') {
            const teams = await Team.find({}).populate('squad');
            for (const team of teams) {
                await requestSquad(team);
            }
            res.send('All squads updated successfully');
        }
    }


}

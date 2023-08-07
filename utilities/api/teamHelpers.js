if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios');
const Team = require('../../models/team');
const Player = require('../../models/player');
const League = require('../../models/league');
const Coach = require('../../models/coach');

const { makeReqObject, hasMonthsPassed } = require('./apiHelpers');

module.exports.requestPLTeams = async () => {
    try {
        const options = makeReqObject('teams', { league: '39', season: '2023' });
        const result = await axios(options);
        const teams = result.data.response;
        const league = await League.findOne({ 'id': 39 });


        const existingIdSet = new Set(existingTeams.map(team => team.id));

        for (let t of teams) {
            // Check if team is already in DB
            if (existingIdSet.has(t.id)) {
                const existingTeam = await Team.findById(t.id);
                if (existingTeam) Object.assign(existingTeam, t);
                await existingTeam.save();
            } else {
                const { id, name, code, country, founded, logo } = t.team;
                const newTeam = new Team({ id, name, code, country, founded, logo });
                newTeam.flag = 'https://media.api-sports.io/flags/gb.svg';
                newTeam.league = league._id;
                newTeam.venue = t.venue;
                await newTeam.save();
            }
        }

        // Remove teams that are no longer in the league
        const updatedIdSet = new Set(teams.map(team => team.id));
        for (let t of existingTeams) {
            if (!updatedIdSet.has(t.id)) {
                t.league = null;
                await t.save();
            }
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports.requestCoach = async (team) => {
    try {
        const options = makeReqObject('coachs', { team: `${team.id}` });
        const result = await axios(options);

        const existingCoachIds = new Set(team.coaches.map(coach => coach.id));
        const updatedCoaches = new Set();

        for (let res of result.data.response) {
            for (let managerStint of res.career) {
                if (managerStint.team.id === team.id && !managerStint.end) {
                    updatedCoaches.add(res);
                }
            }
        }

        // Add or update coaches
        for (let coach of updatedCoaches) {
            if (existingCoachIds.has(coach.id)) {
                // Coach already exists in database
                const existingCoach = await Coach.findOne({ 'id': coach.id });
                if (existingCoach) {
                    coach.team = existingCoach.team;
                    Object.assign(existingCoach, coach)
                    await existingCoach.save();
                } else {
                    console.log('There was an issue finding the coach')
                }
            } else {
                // Coach is not in database yet
                const newCoach = new Coach(coach);
                existingCoachIds.add(newCoach.id);
                console.log('Printing new coach')
                newCoach.team = team._id;
                console.log(newCoach)
                team.coaches.push(newCoach._id);
                await newCoach.save();
                await team.save();
            }
        }

        // Delete coaches that are not in the club 
        const updatedCoachIds = new Set();
        updatedCoaches.forEach(coach => updatedCoachIds.add(coach.id));
        for (let coachId of existingCoachIds) {
            if (!updatedCoachIds.has(coachId)) {
                const deleteCoach = await Coach.findOne({ 'id': coachId });
                const indexToRemove = team.coaches.indexOf(deleteCoach._id);
                if (indexToRemove !== -1) {
                    team.coaches.splice(indexToRemove, 1);
                }
                await Coach.deleteOne(deleteCoach);
                await team.save();
            }
        }
    } catch (error) {
        return error;
    }
    return 'Coach updation successful';
}

module.exports.requestSquad = async (team) => {
    try {
        const options = makeReqObject('players/squads', { team: `${team.id}` });
        const result = await axios(options);
        const players = result.data.response[0].players;

        if (team.squad.length === 0) {
            for (let player of players) {
                const { id, name, age, number, position, photo } = player;
                const newPlayer = new Player({ id, name, age, number, position, photo });
                newPlayer.team = team._id;
                team.squad.push(newPlayer._id);
                await newPlayer.save();
                await team.save();
            }
        } else {
            await makeSquadChanges(team, players);
        }
    } catch (error) {
        return (error)
    }
    return 'Squad updation successful'
}

const makeSquadChanges = async (team, squadFromAPI) => {
    const currentPlayersMap = new Map(team.squad.map((player) => [player.id, player]));

    for (const player of squadFromAPI) {
        const currentPlayer = currentPlayersMap.get(player.id);
        if (currentPlayer) {
            // Update player
            const foundPlayer = await Player.findOne({ 'id': player.id });
            Object.assign(foundPlayer, player);
            await foundPlayer.save();
        } else {
            // Add New Players
            const { id, name, age, number, position, photo } = player;
            const newPlayer = new Player({ id, name, age, number, position, photo });
            newPlayer.team = team._id;
            team.squad.push(newPlayer._id);
            await newPlayer.save();
        }
    }
    // Check for deleted players
    const updatedPlayerSet = new Set(squadFromAPI.map((player) => player.id));
    const updatedSquad = team.squad.filter((player) => updatedPlayerSet.has(player.id));
    const deleteSquad = team.squad.filter((player) => !updatedPlayerSet.has(player.id));

    for (const player of deleteSquad) {
        await Player.deleteMany({ 'id': player.id });
    }

    team.squad = updatedSquad;
    await team.save();
}


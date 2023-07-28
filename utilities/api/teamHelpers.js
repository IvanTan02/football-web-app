if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const Team = require('../../models/team');
const Player = require('../../models/player');
const League = require('../../models/league');
const Coach = require('../../models/coach');
const LastReqDates = require('../../models/lastReqDates');

const { makeReqObject, hasMonthsPassed } = require('./apiHelpers');
const currentDate = new Date();

module.exports.requestPLTeams = async () => {
    try {
        const lastReqDate = await LastReqDates.findOne();
        const currentDate = new Date();

        // if (!lastReqDate || hasMonthsPassed(lastReqDate.lastTeamsReq, currentDate, 1)) {
        const options = makeReqObject('teams', { league: '39', season: '2023' });
        const result = await axios(options);
        const teams = result.data.response;
        // const league = await League.findOne({ 'id': 39 });

        for (let t of teams) {
            const { id, name, code, country, founded, logo } = t.team;
            const newTeam = new Team({ id, name, code, country, founded, logo });
            newTeam.flag = 'https://media.api-sports.io/flags/gb.svg';
            // newTeam.league = league._id;
            newTeam.venue = t.venue;
            await newTeam.save();
        }

        //     if (lastReqDate) {
        //         lastReqDate.lastTeamsReq = currentDate;
        //         await lastReqDate.save();
        //     } else {
        //         await LastReqDates.create({ lastTeamsReq: currentDate });
        //     }
        // } else {
        //     console.log('Request already executed this month. Skipping...');
        // }
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
        console.log(error);
    }
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
        console.log(error);
    }
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


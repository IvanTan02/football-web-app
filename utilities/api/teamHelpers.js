if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios');

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

        if (!lastReqDate || hasMonthsPassed(lastReqDate.lastTeamsReq, currentDate, 1)) {
            const options = makeReqObject('teams', { league: '39', season: '2023' });
            const result = await axios(options);
            const teams = result.data.response;
            const league = await League.findOne({ 'id': 39 });

            for (let t of teams) {
                const { id, name, code, country, founded, logo } = t.team;
                const newTeam = new Team({ id, name, code, country, founded, logo });
                newTeam.flag = 'https://media.api-sports.io/flags/gb.svg';
                newTeam.league = league._id;
                newTeam.venue = t.venue;
                await newTeam.save();
            }

            if (lastReqDate) {
                lastReqDate.lastTeamsReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastTeamsReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports.requestCoach = async (team) => {
    try {
        const lastReqDate = await LastReqDates.findOne();

        if (!lastReqDate.lastCoachReq || hasMonthsPassed(lastReqDate.lastCoachReq, currentDate, 1)) {
            const options = makeReqObject('coachs', { team: `${team.id}` });
            const result = await axios(options);
            const { firstname, lastname, age, nationality, photo } = result.data.response[0];
            const newCoach = new Coach({ firstname, lastname, age, nationality, photo });
            newCoach.team = team._id;
            team.coach = newCoach._id;
            await newCoach.save();
            await team.save();

            if (lastReqDate) {
                lastReqDate.lastCoachReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastCoachReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports.requestSquad = async (team) => {
    try {
        const lastReqDate = await LastReqDates.findOne();

        if (!lastReqDate.lastSquadReq || hasMonthsPassed(lastReqDate.lastSquadReq, currentDate, 1)) {
            const options = makeReqObject('players/squads', { team: `${team.id}` });
            const result = await axios(options);
            const players = result.data.response[0].players;
            for (let player of players) {
                const { id, name, age, number, position, photo } = player;
                const newPlayer = new Player({ id, name, age, number, position, photo });
                newPlayer.team = team._id;
                team.squad.push(newPlayer._id);
                await newPlayer.save();
                await team.save();
            }

            if (lastReqDate) {
                lastReqDate.lastSquadReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastSquadReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}


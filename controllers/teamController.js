if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const Team = require('../models/team');
const LastReqDates = require('../models/lastReqDates');
const axios = require('axios');

const requestPLTeams = async () => {
    try {
        const lastReqDate = await LastReqDates.findOne();
        const currentDate = new Date();

        if (!lastReqDate || hasMonthPassed(lastReqDate.lastPLTeamsReq, currentDate)) {
            const options = {
                method: 'GET',
                url: 'https://v3.football.api-sports.io/teams',
                params: { league: '39', season: '2023' },
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
                },
            };

            console.log('Making request')
            const result = await axios(options);
            console.dir(result.data.response);
            const teams = result.data.response;

            for (let team of teams) {
                const newTeam = new Team(team.team);
                await newTeam.save();
            }

            console.log('Teams saved successfully');

            if (lastReqDate) {
                lastReqDate.lastPLTeamsReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastPLTeamsReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}

const hasMonthPassed = (lastDate, currentDate) => {
    const diffInMonths = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());
    return diffInMonths >= 1;
}

module.exports.loadPLTeams = async (req, res) => {
    await requestPLTeams();
    const teams = await Team.find({});
    res.render('teams/index', { teams });
}
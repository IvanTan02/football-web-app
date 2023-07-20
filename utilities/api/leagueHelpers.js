if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios');

const LastReqDates = require('../../models/lastReqDates');
const League = require('../../models/league');
const Team = require('../../models/team');

const { makeReqObject, hasMonthsPassed } = require('./apiHelpers');
const currentDate = new Date();

module.exports.requestStandings = async () => {
    try {
        const lastReqDate = await LastReqDates.findOne();

        // if (!lastReqDate.lastStandingReq || hasMonthsPassed(lastReqDate.lastStandingReq, currentDate, 1)) {
        const options = makeReqObject('/standings', { league: '39', season: '2023' });
        const result = await axios(options);
        const response = result.data.response[0].league;
        const { id, name, country, logo, flag, season } = response;
        const league = new League({ id, name, country, logo, flag, season });
        league.standings = [];

        const leagueTable = response.standings[0];
        for (let i = 0; i < leagueTable.length; i++) {
            const team = await Team.findOne({ 'id': leagueTable[i].team.id });
            console.log(team.name);
            console.log(team._id)
            league.standings.push(leagueTable[i]);
            league.standings[i].team = team._id;

        }
        await league.save();

        //     if (lastReqDate) {
        //         lastReqDate.lastStandingReq = currentDate;
        //         await lastReqDate.save();
        //     } else {
        //         await LastReqDates.create({ lastStandingReq: currentDate });
        //     }
        // } else {
        //     console.log('Request already executed this month. Skipping...');
        // }
    } catch (e) {
        console.log(e);
    }
}




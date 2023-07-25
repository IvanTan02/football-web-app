if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const axios = require('axios');

const League = require('../../models/league');
const Team = require('../../models/team');

const { makeReqObject } = require('./apiHelpers');

module.exports.requestStandings = async () => {
    try {
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
            team.league = league._id;
            await team.save();
        }
        await league.save();
    } catch (e) {
        console.log(e);
    }
}




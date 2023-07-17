if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const League = require('../models/league');
const axios = require('axios');

module.exports.getLeagueTable = async (req, res) => {
    const options = {
        method: 'GET',
        url: 'https://v3.football.api-sports.io/standings',
        params: { league: '39', season: '2019' },
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': '199f33e7ad0401610965c6f9dbfeaf81',
        },
    };
    try {
        console.log('Making request')
        // const result = await axios(options);
        // console.dir(result.data.response[0]);
        // console.dir(result.data.response[0].standings[0]);
        // const league = new League(result.data.response[0]);
        // await league.save();
    } catch (e) {
        console.log(e);
    }
}

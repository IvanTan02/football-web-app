if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports.makeReqObject = (endpoint, params) => {
    const reqObject = {
        method: 'GET',
        url: `https://v3.football.api-sports.io/${endpoint}`,
        params: params,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        }
    }
    return reqObject;
}

module.exports.hasMonthsPassed = (lastDate, currentDate, timeInMonths) => {
    const diffInMonths = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());
    return diffInMonths >= timeInMonths;
}
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

module.exports.getTodaysDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const formattedDate = `${year}-${addLeadingZero(month)}-${addLeadingZero(day)}`;
    return formattedDate;
}

const addLeadingZero = (value) => {
    return value < 10 ? `0${value}` : value;
}

const axios = require('axios')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const { getFootballAPIHeaders } = require('./utilities/api/apiHelpers')

const ping = 'https://eplcentral-football-app.onrender.com/health'

const reqObject = {
    method: 'PUT',
    url: `https://api.cron-job.org/jobs`,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.CRON_API_KEY,
    },
    data: {
        job: {
            url: ping,
            enabled: true,
            saveResponses: true,
            schedule: {
                timezone: 'Asia/Kuala_Lumpur',
                expiresAt: '20230907093900',
                hours: [9],
                mdays: [7],
                minutes: [-1, 5],
                months: [9],
                wdays: [-1]
            }
        }
    }

}

async function createCronJobTest() {
    try {
        const res = await axios(reqObject)
        console.log(res.data);
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

createCronJobTest();


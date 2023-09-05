
const axios = require('axios')

const ping = 'https://eplcentral-football-app.onrender.com/health'

const reqObject = {
    method: 'PUT',
    url: `https://api.cron-job.org/jobs`,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer W0u0c9HmhKMCzmulsHAYEV7Si2SIoTaxTSXpdLN34ps=',
    },
    data: {
        job: {
            url: ping,
            enabled: true,
            saveResponses: true,
            schedule: {
                timezone: 'Asia/Kuala_Lumpur',
                expiresAt: '20230905093900',
                hours: [-1],
                mdays: [-1],
                minutes: [-1],
                months: [-1],
                wdays: [-1]
            }
        }
    }

}

async function createCronJob() {
    try {
        const res = await axios(reqObject)
        console.log(res.data);
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

createCronJob();


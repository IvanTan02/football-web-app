
const axios = require('axios');

const { updateFixtures, getTodaysFixtures } = require('./fixtureHelper');
const { requestStandings } = require('./leagueHelpers');
const { getTodaysDate, createLogMessage } = require('./apiHelpers');

let scheduledFixtureJobs = new Map();
const fixturesByStartTime = new Map();
const todaysDate = getTodaysDate();

module.exports.dailyScheduler = async () => {
    console.log(createLogMessage('Running daily scheduler'));
    await updateFixtures();
    await requestStandings();
    // Check if there is any fixtures today
    // const todaysFixtures = await getTodaysFixtures(todaysDate);
    const todaysFixtures = await getTodaysFixtures('2023-10-21');
    if (todaysFixtures.length !== 0) {
        await processTodaysFixtures(todaysFixtures);
    }
};

const processTodaysFixtures = async (todaysFixtures) => {

    console.log(createLogMessage('Grouping todays fixtures based on start time'))
    console.log(todaysFixtures)

    // Group fixtures by start times 
    for (let fixture of todaysFixtures) {
        const startTime = fixture.date;
        if (!fixturesByStartTime.has(startTime)) {
            fixturesByStartTime.set(startTime, []);
        }
        fixturesByStartTime.get(startTime).push(fixture.id);
    }
    console.log(fixturesByStartTime)
    await scheduleJobsForStartTimes();
}

const scheduleJobsForStartTimes = async () => {

    console.log(createLogMessage('Scheduling jobs for each start time'))

    for (const [startTime, fixtureGroup] of fixturesByStartTime) {
        // Create a cron job for each start time group
        const jobObj = createJobObject(startTime)
        const job = await createCronJob(jobObj);
        if (!scheduledFixtureJobs.has(startTime)) {
            scheduledFixtureJobs.set(startTime, job)
        }
    }
}

const createCronJob = async (job) => {
    const { url, schedule, params } = job;
    const cronJob = {
        method: 'PUT',
        url: `https://api.cron-job.org/jobs`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer W0u0c9HmhKMCzmulsHAYEV7Si2SIoTaxTSXpdLN34ps=',
        },
        data: {
            job: {
                url: url,
                enabled: true,
                saveResponses: true,
                schedule: schedule,
                params: params
            }
        }
    }
    const response = await axios(cronJob);
    return response.data.jobId;
}

const deleteCronJob = async (jobId) => {
    const jobToDelete = {
        method: 'DELETE',
        url: `https://api.cron-job.org/jobs/${jobId}`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer W0u0c9HmhKMCzmulsHAYEV7Si2SIoTaxTSXpdLN34ps=',
        },
    }
    const res = await axios(jobToDelete);
    if (JSON.stringify(res.data) === '{}') return `Job (${jobId}) has been deleted`;
}

module.exports.makeScheduledFixtureCall = async (startTime) => {
    const currentTime = new Date();
    if (currentTime.getMinutes() % 5 !== 0) return;

    // Make API update call
    const fixtures = fixturesByStartTime.get(startTime);
    const fixtureIds = fixtures.filter(f => f.id)

    // Dummy Test
    createLogMessage(`Updating fixture with these ids:`)
    console.log(fixtureIds)

    // Check if all fixtures for this batch has finished
    // const { updatedFixtures } = await updateFixtures(fixtureIds)
    // const allFixturesFullTime = updatedFixtures.every((fixture) => fixture.status.long === 'Match Finished');
    // if (allFixturesFullTime) {
    //     // Delete the job
    //     const jobId = scheduledFixtureJobs.get(startTime);
    //     const deleteResult = await deleteCronJob(jobId)
    //     createLogMessage(deleteResult)

    //     // Make a standings call
    //     await requestStandings();
    //     return;
    // }

    // Response
    return {
        statusCode: 200,
        message: 'Fixture Call OK'
    }
}

const createJobObject = (startTime) => {
    const url = 'https://eplcentral-football-app.onrender.com/fixtures/scheduled';
    const schedule = createJobSchedule(startTime);
    console.log(schedule)
    const params = {
        startTime: startTime
    }
    return {
        url: url,
        schedule: schedule,
        params: params
    }
}

const createJobSchedule = (startTime) => {
    const dateObj = new Date(startTime);
    const schedule = {
        timezone: 'Asia/Kuala_Lumpur',
        expiresAt: 0,
        months: [dateObj.getMonth() + 1],
        mdays: [dateObj.getDate()],
        hours: [dateObj.getHours()],
        minutes: [-1, dateObj.getMinutes()],
        wdays: [-1]
    }
    return schedule;
}

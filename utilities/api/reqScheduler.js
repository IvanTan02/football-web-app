const cron = require('node-cron');

const { updateFixtures, getTodaysFixtures } = require('./fixtureHelper');
const { requestStandings } = require('./leagueHelpers');
const { getTodaysDate, createLogMessage } = require('./apiHelpers');

const Fixture = require('../../models/fixture');

let scheduledFixtureJobs = new Map();
let recurringFixtureJobs = new Map();
const fixturesByStartTime = new Map();
const todaysDate = getTodaysDate();

module.exports.dailyScheduler = async () => {
    // Run everyday at 12am
    console.log(createLogMessage('Running daily scheduler'));
    // Check if there is any fixtures today
    const todaysFixtures = await getTodaysFixtures('2023-08-26');
    if (todaysFixtures.length !== 0) {
        await processTodaysFixtures(todaysFixtures);
    }
};

const processTodaysFixtures = async (todaysFixtures) => {

    console.log(createLogMessage('Grouping todays fixtures start times'))
    console.log(todaysFixtures)

    // Group fixtures by start times 
    for (let fixture of todaysFixtures) {
        const startTime = fixture.date;
        if (!fixturesByStartTime.has(startTime)) {
            fixturesByStartTime.set(startTime, []);
        }
        fixturesByStartTime.get(startTime).push(fixture);
    }
    console.log(fixturesByStartTime)
    await scheduleFixtureJobs(fixturesByStartTime);
}

const scheduleFixtureJobs = async (fixturesByStartTime) => {

    console.log(createLogMessage('Scheduling jobs for each start time'))

    for (const [startTime, fixtureGroup] of fixturesByStartTime) {
        try {
            const newJob = cron.schedule(getCronTime(startTime), async () => {
                console.log(createLogMessage(`Scheduling jobs for ${startTime} `))
                await processFixturesForStartTime(startTime, fixtureGroup);
            },
                {
                    scheduled: true,
                    timezone: "Asia/Kuala_Lumpur",
                })
            scheduledFixtureJobs.set(startTime, newJob)
        } catch (error) {
            console.log(error)
        }
    }
}

const processFixturesForStartTime = async (startTime, fixtureGroup) => {
    try {
        console.log(createLogMessage('Processing current start time fixtures'))

        const response = await updateFixturesInGroup(fixtureGroup);
        const { updatedFixtures } = response;

        const allFixturesFullTime = updatedFixtures.every((fixture) => fixture.status.long === 'Match Finished');
        if (allFixturesFullTime) {
            console.log(createLogMessage('Fixtures in current batch FT. Stopping jobs.'))
            if (recurringFixtureJobs.has(startTime)) {
                recurringFixtureJobs.get(startTime).stop();
                recurringFixtureJobs.delete(startTime);
            }

            if (scheduledFixtureJobs.has(startTime)) {
                scheduledFixtureJobs.get(startTime).stop();
                scheduledFixtureJobs.delete(startTime);
            }

            const allFixturesDone = await areAllFixturesDone();
            if (allFixturesDone) {
                console.log(createLogMessage('All fixtures at this time is done. Requesting standings'))
                await requestStandings();
            }
            return;
        }

        if (!recurringFixtureJobs.has(startTime)) {
            try {
                const newJob = cron.schedule('*/5 * * * *', () => {
                    console.log(createLogMessage(`Calling fixtures at ${startTime} every 5 minutes`))
                    processFixturesForStartTime(startTime, fixtureGroup);
                });
                recurringFixtureJobs.set(startTime, newJob);
            } catch (error) {
                console.log(error)
            }
        }

    } catch (error) {
        console.log(error)
    }
}

const updateFixturesInGroup = async (fixtureGroup) => {
    const fixtureIds = fixtureGroup.map(fixture => fixture.id);

    // Extracting the current matchweek
    const regex = /(\d+)/;
    const match = fixtureGroup[0].round.match(regex);
    if (match && match[1]) {
        const matchweek = parseInt(match[1], 10);
        console.log(createLogMessage(`Updating fixtures for ${matchweek}`))
        const response = await updateFixtures(matchweek, fixtureIds)
        return response;
    }
    return createLogMessage('All fixtures at this time is done. Requesting standings');
}

const areAllFixturesDone = async () => {
    const todaysFixtures = await getTodaysFixtures(todaysDate);
    return todaysFixtures.every((fixture) => fixture.status.long === 'Match Finished')
}

const getCronTime = (time) => {
    const minute = new Date(time).getMinutes();
    const hour = new Date(time).getHours();
    return `${minute} ${hour} * * *`;
}

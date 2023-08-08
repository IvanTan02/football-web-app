const cron = require('node-cron');

const { updateFixtures, getTodaysFixtures } = require('./fixtureHelper');
const { requestStandings } = require('./leagueHelpers');
const { getTodaysDate, createLogMessage } = require('./apiHelpers');

let dailySchedulerTask;
let scheduledFixtureJobs = new Map();
let recurringFixtureJobs = new Map();
const fixturesByStartTime = new Map();

module.exports.dailyScheduler = () => {
    if (dailySchedulerTask) {
        dailySchedulerTask.stop();
        dailySchedulerTask.destroy();
    }
    // Run everyday at 12am
    dailySchedulerTask = cron.schedule("0 0 * * * *", async () => {
        console.log(createLogMessage('Running daily scheduler'))
        // Check if there is any fixtures today
        const todaysDate = getTodaysDate();
        const todaysFixtures = await getTodaysFixtures(todaysDate);
        if (todaysFixtures.length !== 0) {
            await processTodaysFixtures(todaysFixtures);
        }
    },
        {
            scheduled: true,
            timezone: "Asia/Kuala_Lumpur",
        }
    );
};

const processTodaysFixtures = async (todaysFixtures) => {

    console.log(createLogMessage('Grouping todays fixtures start times'))

    // Group fixtures by start times 
    for (let fixture of todaysFixtures) {
        const startTime = fixture.date;
        if (!fixturesByStartTime.has(startTime)) {
            fixturesByStartTime.set(startTime, []);
        }
        fixturesByStartTime.get(startTime).push(fixture);
    }
    await scheduleFixtureJobs(fixturesByStartTime);
}

const scheduleFixtureJobs = async (fixturesByStartTime) => {

    console.log(createLogMessage('Scheduling jobs for each start time'))

    for (const [startTime, fixtureGroup] of fixturesByStartTime) {
        const newJob = cron.schedule(new Date(startTime), async () => {
            await processFixturesForStartTime(startTime, fixtureGroup);
        })
        scheduledFixtureJobs.set(startTime, newJob)
    }
}

const processFixturesForStartTime = async (startTime, fixtureGroup) => {
    try {
        console.log(createLogMessage('Processing current start time fixtures'))

        await updateFixturesInGroup(fixtureGroup)

        const allFixturesFullTime = fixtureGroup.every((fixture) => fixture.status.long === 'Full Time');
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

            if (areAllFixturesDone()) {
                console.log(createLogMessage('All fixtures today done. Requesting standings'))
                await requestStandings();
            }
            return; // Stop the function for this start time
        }

        if (!recurringFixtureJobs.has(startTime)) {
            const newJob = cron.schedule('*/5 * * * *', () => {
                console.log(createLogMessage(`Calling fixtures at ${startTime} every 5 minutes`))
                processFixturesForStartTime(startTime, fixtureGroup); // Call the function again for the current start time
            });
            recurringFixtureJobs.set(startTime, newJob);
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
        await updateFixtures(matchweek, fixtureIds)
    }
}

const areAllFixturesDone = () => {
    for (const [startTime, job] of scheduleFixtureJobs) {
        const fixtureGroup = fixturesByStartTime.get(startTime);
        if (!fixtureGroup.every((fixture) => fixture.status.long === 'Full Time')) {
            return false;
        }
    }
    return true;
}

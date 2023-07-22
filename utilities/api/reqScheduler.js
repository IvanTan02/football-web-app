const cron = require('node-cron');

const { addNewFixtures,
    updateFixtures,
    getTodaysFixtures,
    getEarliestFixtureTime,
    getLatestFixtureTime,
    getCurrentRound } = require('./fixtureHelper');
const { reqStandings } = require('./leagueHelpers');

let regularSchedulerTask;

module.exports.regularScheduler = () => {

    if (regularSchedulerTask) {
        regularSchedulerTask.stop();
        regularSchedulerTask.destroy();
    }

    regularSchedulerTask = cron.schedule('0 0 * * * *', async () => {
        const todaysFixtures = await getTodaysFixtures('2023-08-12');
        if (todaysFixtures.length !== 0) {
            const startTime = getEarliestFixtureTime(todaysFixtures);
            const endTime = getLatestFixtureTime(todaysFixtures) + 1000 * 60 * 60 * 3;
            const round = getCurrentRound();
            // run scheduler
            console.log('Today is a matchday.... Running fixture scheduler')
            await fixtureScheduler(startTime, endTime, round, standingScheduler);
        } else {
            console.log('Today is not matchday....')
            // Check if matchweek is over
            if (allFixturesPassed()) {
                const newRound = getCurrentRound() + 1;
                await addNewFixtures(newRound);
            }
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kuala_Lumpur'
    })
}

const fixtureScheduler = async (startTime, endTime, round, standingScheduler) => {
    const intervalTime = 1000 * 60 * 60; // 1 hour interval
    const startDelay = startTime - Date.now();

    setTimeout(async () => {
        const interval = setInterval(async () => {
            console.log('Making request to API ------');
            await updateFixtures(round);

            if (Date.now() >= endTime) {
                console.log('Fixture scheduler stopped at', endTime);
                clearInterval(interval);
                if (typeof standingScheduler === 'function') {
                    await standingScheduler();
                }
            }
        }, intervalTime);

        console.log('Task started at', startTime);
    }, startDelay);
}

// Run after the fixtureScheduler has finished running
const standingScheduler = async () => {
    await reqStandings();
}


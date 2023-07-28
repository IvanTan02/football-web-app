const cron = require('node-cron');

const { updateFixtures, getTodaysFixtures, getEarliestFixtureTime, getLatestFixtureTime, getCurrentRound } = require('./fixtureHelper');
const { requestStandings } = require('./leagueHelpers');
const { renderHomePage } = require('../../controllers/leagueController');

let dailySchedulerTask;

module.exports.dailyScheduler = () => {
    if (dailySchedulerTask) {
        dailySchedulerTask.stop();
        dailySchedulerTask.destroy();
    }
    // Run everyday at 12am
    dailySchedulerTask = cron.schedule("0 0 * * * *", async () => {
        // Check if there is any fixtures today
        const todaysFixtures = await getTodaysFixtures("2023-08-12");
        if (todaysFixtures.length !== 0) {
            const startTime = getEarliestFixtureTime(todaysFixtures);
            const endTime = getLatestFixtureTime(todaysFixtures) + 1000 * 60 * 60 * 2.5;
            const round = todaysFixtures[0].round // Get the  current round

            // Run fixture scheduler
            console.log(`Today is a matchday of gameweek ${round}.... Running fixture scheduler`);
            await fixtureScheduler(startTime, endTime, round, requestStandings);
        }
    },
        {
            scheduled: true,
            timezone: "Asia/Kuala_Lumpur",
        }
    );
};

const fixtureScheduler = async (startTime, endTime, round, requestStandings) => {
    const intervalTime = 1000 * 60 * 30; // 30 minute call interval
    const startDelay = startTime - Date.now();

    setTimeout(async () => {
        const interval = setInterval(async () => {
            console.log("Making request to Fixtures Endpoint ------");
            await updateFixtures(round);

            if (Date.now() >= endTime) {
                console.log("Fixture scheduler stopped at", endTime);
                clearInterval(interval);
                if (typeof requestStandings === "function") {
                    await requestStandings();
                }
            }
        }, intervalTime);

        console.log("Fixture scheduler started at", startTime);
    }, startDelay);
};

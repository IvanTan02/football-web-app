if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const axios = require('axios');

const LastReqDates = require('../../models/lastReqDates');
const League = require('../../models/league');
const Team = require('../../models/team');
const Fixture = require('../../models/fixture');

const { makeReqObject, hasMonthsPassed, getTodaysDate } = require('./apiHelpers');

const reqFixtures = async (matchweek) => {
    const params = {
        league: '39',
        season: '2023',
        round: `Regular Season - ${matchweek}`,
        timezone: 'Asia/Kuala_Lumpur'
    }
    const options = makeReqObject('/fixtures', params);
    const result = await axios(options);
    return result;
}

module.exports.addNewFixtures = async (matchweek) => {
    const result = await reqFixtures(matchweek);
    for (let f of result.data.response) {
        const { id, date, timestamp, venue, status } = f.fixture;

        // Check if fixture already exists in database
        const isThereRecord = await Fixture.findOne({ 'id': id });
        if (isThereRecord) continue;

        // Create new fixture and save to database
        const newFixture = new Fixture({ id, date, timestamp, venue, status });
        const league = await League.findOne({});
        newFixture.league = league._id;
        newFixture.round = f.league.round;
        const homeTeam = await Team.findOne({ 'id': f.teams.home.id });
        const awayTeam = await Team.findOne({ 'id': f.teams.away.id });
        newFixture.teams.home = homeTeam;
        newFixture.teams.away = awayTeam;
        newFixture.goals.home = 0;
        newFixture.goals.away = 0;
        await newFixture.save();
    }
}

module.exports.updateFixtures = async (matchweek) => {
    const result = await reqFixtures(matchweek);
    for (let f of result.data.response) {
        const { id } = f.fixture;
        const fixture = await Fixture.findOne({ id });

        if (fixture) {
            if (fixture.status.short !== f.fixture.status.short) fixture.status = f.fixture.status;
            if (fixture.goals.home !== f.goals.home || fixture.goals.away !== f.goals.away) fixture.goals = f.goals;
            if (compareScores(fixture.score, f.score)) fixture.score = f.score;
            await fixture.save();
        }
    }
}

const compareScores = (existingScore, apiScore) => {
    return (
        existingScore.halftime.home !== apiScore.halftime.home ||
        existingScore.halftime.away !== apiScore.halftime.away ||
        existingScore.fulltime.home !== apiScore.fulltime.home ||
        existingScore.fulltime.away !== apiScore.fulltime.away ||
        existingScore.extratime.home !== apiScore.extratime.home ||
        existingScore.extratime.away !== apiScore.extratime.away ||
        existingScore.penalty.home !== apiScore.penalty.home ||
        existingScore.penalty.away !== apiScore.penalty.away
    );
}

module.exports.allFixturesPassed = async () => {
    const fixtures = await Fixture.find({});
    const currentDate = new Date();

    const allFixturesPassed = fixtures.every((fixture) => {
        const fixtureDate = new Date(fixture.date);
        return fixtureDate <= currentDate;
    });
    return allFixturesPassed;
}

module.exports.getCurrentRound = async () => {
    const fixtures = await Fixture.find({});
    const regex = /(\d+)/;
    let latestRound = 1;

    for (const fixture of fixtures) {
        const match = fixture.round.match(regex);
        if (match) {
            const round = parseInt(match[0]);
            latestRound = Math.max(latestRound, round);
        }
    }
    console.log(latestRound);
    return latestRound;
}

module.exports.getTodaysFixtures = async (todaysDate) => {
    const fixturesToday = await Fixture.aggregate([
        {
            $match: {
                date: {
                    $regex: todaysDate,
                    $options: 'i'
                }
            }
        }
    ]);
    return fixturesToday;
}

module.exports.getEarliestFixtureTime = (todaysFixtures) => {
    const earliestFixture = todaysFixtures.reduce((earliest, currentFixture) => {
        const currentTimestamp = new Date(currentFixture.date).getTime();
        const earliestTimestamp = earliest ? new Date(earliest.date).getTime() : 0;
        return currentTimestamp < earliestTimestamp ? currentFixture : earliest;
    });
    return new Date(earliestFixture.date).getTime();
}

module.exports.getLatestFixtureTime = (todaysFixtures) => {
    const latestFixture = todaysFixtures.reduce((latest, currentFixture) => {
        const currentTimestamp = new Date(currentFixture.date).getTime();
        const latestTimestamp = latest ? new Date(latest.date).getTime() : 0;
        return currentTimestamp > latestTimestamp ? currentFixture : latest;
    });
    return new Date(latestFixture.date).getTime();
}













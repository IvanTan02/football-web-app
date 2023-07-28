if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const axios = require("axios");

const LastReqDates = require("../../models/lastReqDates");
const League = require("../../models/league");
const Team = require("../../models/team");
const Fixture = require("../../models/fixture");

const {
  makeReqObject,
  hasMonthsPassed,
  getTodaysDate,
} = require("./apiHelpers");

// Setting enum values for rounds
const Rounds = {
  PAST: 'Past',
  CURRENT: 'Current',
  UPCOMING: 'Upcoming'
}

const reqFixtures = async (matchweek) => {
  const params = {
    league: "39",
    season: "2023",
    round: `Regular Season - ${matchweek}`,
    timezone: "Asia/Kuala_Lumpur",
  };
  const options = makeReqObject("/fixtures", params);
  const result = await axios(options);
  return result;
};

module.exports.updateFixtures = async (matchweek) => {
  try {
    const result = await reqFixtures(matchweek);
    for (let f of result.data.response) {
      const { id } = f.fixture;
      const fixture = await Fixture.findOne({ id });

      if (fixture) {
        fixture.status = f.fixture.status;
        fixture.goals = f.goals;
        fixture.score = f.score;
        await fixture.save();
      }
    }
  } catch (error) {
    console.log("PROBLEM UPDATING FIXTURE: ", error);
  }
};

module.exports.getTodaysFixtures = async (todaysDate) => {
  const fixturesToday = await Fixture.aggregate([
    {
      $match: {
        date: {
          $regex: todaysDate,
          $options: "i",
        },
      },
    },
  ]);
  return fixturesToday;
};

module.exports.getEarliestFixtureTime = (todaysFixtures) => {
  const earliestFixture = todaysFixtures.reduce((earliest, currentFixture) => {
    const currentTimestamp = new Date(currentFixture.date).getTime();
    const earliestTimestamp = earliest ? new Date(earliest.date).getTime() : 0;
    return currentTimestamp < earliestTimestamp ? currentFixture : earliest;
  });
  return new Date(earliestFixture.date).getTime();
};

module.exports.getLatestFixtureTime = (todaysFixtures) => {
  const latestFixture = todaysFixtures.reduce((latest, currentFixture) => {
    const currentTimestamp = new Date(currentFixture.date).getTime();
    const latestTimestamp = latest ? new Date(latest.date).getTime() : 0;
    return currentTimestamp > latestTimestamp ? currentFixture : latest;
  });
  return new Date(latestFixture.date).getTime();
};

module.exports.getRoundFixtures = (fixtures, round) => {
  const rounds = getRoundsDates(fixtures);
  const currentRound = getCurrentRound(rounds);

  if (!Object.values(Rounds).includes(round)) return;
  let roundFixtures;

  switch (round) {
    case Rounds.PAST:
      roundFixtures = fixtures.filter(
        (fixture) => fixture.round === `Regular Season - ${currentRound - 1}`
      );
      break;

    case Rounds.CURRENT:
      roundFixtures = fixtures.filter(
        (fixture) => fixture.round === `Regular Season - ${currentRound}`
      );
      break;

    case Rounds.UPCOMING:
      roundFixtures = fixtures.filter(
        (fixture) => fixture.round === `Regular Season - ${currentRound + 1}`
      );
      break;
  }
  return roundFixtures;

};

const getRoundsDates = (fixtures) => {
  const roundsMap = new Map();
  console.log(fixtures)

  for (const fixture of fixtures) {
    const round = fixture.round;

    const fixtureDate = new Date(fixture.date);

    if (roundsMap.has(round)) {
      const roundData = roundsMap.get(round);
      roundData.startDate = new Date(
        Math.min(roundData.startDate, fixtureDate)
      );
      roundData.endDate = new Date(Math.max(roundData.endDate, fixtureDate));
    } else {
      roundsMap.set(round, {
        startDate: fixtureDate,
        endDate: fixtureDate,
      });
    }
  }

  const roundsArray = Array.from(roundsMap, ([round, dates]) => ({
    round,
    startDate: dates.startDate,
    endDate: dates.endDate,
  }));

  return roundsArray;
};

const getCurrentRound = (rounds) => {
  const currentDate = new Date("2023-08-20T19:00:00.000Z");

  for (let i = 0; i < rounds.length; i++) {
    const { startDate, endDate } = rounds[i];
    if (currentDate >= startDate && currentDate <= endDate) return i + 1;
  }
  return 1;
};



// OLD STUFF

// const compareScores = (existingScore, apiScore) => {
//   return (
//     existingScore.halftime.home !== apiScore.halftime.home ||
//     existingScore.halftime.away !== apiScore.halftime.away ||
//     existingScore.fulltime.home !== apiScore.fulltime.home ||
//     existingScore.fulltime.away !== apiScore.fulltime.away ||
//     existingScore.extratime.home !== apiScore.extratime.home ||
//     existingScore.extratime.away !== apiScore.extratime.away ||
//     existingScore.penalty.home !== apiScore.penalty.home ||
//     existingScore.penalty.away !== apiScore.penalty.away
//   );
// };

// module.exports.getCurrentRound = async () => {
//   const fixtures = await Fixture.find({});
//   const regex = /(\d+)/;
//   let latestRound = 1;

//   for (const fixture of fixtures) {
//     const match = fixture.round.match(regex);
//     if (match) {
//       const round = parseInt(match[0]);
//       latestRound = Math.max(latestRound, round);
//     }
//   }
//   console.log(latestRound);
//   return latestRound;
// };

// module.exports.addNewFixtures = async (matchweek) => {
//   const result = await reqFixtures(matchweek);
//   for (let f of result.data.response) {
//     const { id, date, timestamp, venue, status } = f.fixture;

//     // Check if fixture already exists in database
//     const isThereRecord = await Fixture.findOne({ id: id });
//     if (isThereRecord) continue;

//     // Create new fixture and save to database
//     const newFixture = new Fixture({ id, date, timestamp, venue, status });
//     const league = await League.findOne({});
//     newFixture.league = league._id;
//     newFixture.round = f.league.round;
//     const homeTeam = await Team.findOne({ id: f.teams.home.id });
//     const awayTeam = await Team.findOne({ id: f.teams.away.id });
//     newFixture.teams.home = homeTeam;
//     newFixture.teams.away = awayTeam;
//     newFixture.goals.home = 0;
//     newFixture.goals.away = 0;
//     await newFixture.save();
//   }
// };


// module.exports.allFixturesPassed = async () => {
//   const fixtures = await Fixture.find({});
//   const currentDate = new Date();

//   const allFixturesPassed = fixtures.every((fixture) => {
//     const fixtureDate = new Date(fixture.date);
//     return fixtureDate <= currentDate;
//   });
//   return allFixturesPassed;
// };
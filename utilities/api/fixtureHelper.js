const axios = require("axios");

const League = require("../../models/league");
const Team = require("../../models/team");
const Fixture = require("../../models/fixture");

const { makeReqObject } = require("./apiHelpers");

// ENUM VALUES FOR ROUNDS
const Rounds = {
  PAST: 'Past',
  CURRENT: 'Current',
  UPCOMING: 'Upcoming'
}

const reqFixtures = async (matchweek = null, fixtureIds = null) => {
  console.log('Requesting fixtures....')
  const params = {
    league: "39",
    season: "2023",
    timezone: "Asia/Kuala_Lumpur",
  };
  if (matchweek) params.round = `Regular Season - ${matchweek}`;
  if (fixtureIds) params.ids = fixtureIds.join('-');
  const options = makeReqObject("/fixtures", params);
  const result = await axios(options);
  return result;
};

module.exports.updateFixtures = async (matchweek = null, fixtureIds = null) => {
  try {
    const updatedFixtures = [];
    const result = await reqFixtures(matchweek, fixtureIds);
    console.log('Got the fixtures... updating them in db')
    for (let f of result.data.response) {
      const { id } = f.fixture;
      const existingFixture = await Fixture.findOne({ id });

      if (existingFixture) {
        console.log('Found the existing fixture...')
        // console.log(f.fixture.status)
        // console.log(f.goals)
        existingFixture.status = f.fixture.status;
        if (f.goals.home || f.goals.away) {
          existingFixture.goals = f.goals;
        }
        await existingFixture.save();
        console.log('Updating fixture id: ', existingFixture.id)
        console.log(existingFixture.status.long);
        updatedFixtures.push(existingFixture);
      }
    }
    console.log('Fixtures updated in db.... should be fine')
    const responseObj = {
      updatedFixtures,
      message: 'Fixture updation successful'
    }
    return responseObj;
  } catch (error) {
    return 'Im sad';
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
  const currentDate = new Date();

  for (let i = 0; i < rounds.length; i++) {
    const { startDate, endDate } = rounds[i];
    if (currentDate >= startDate && currentDate <= endDate) return i + 1;
  }
  return 1;
};

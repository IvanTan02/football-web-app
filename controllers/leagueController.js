if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const moment = require("moment-timezone");

const League = require("../models/league");
const Fixture = require("../models/fixture");
const { getRoundFixtures } = require("../utilities/api/fixtureHelper");
const { requestStandings } = require('../utilities/api/leagueHelpers');

module.exports.renderHomePage = async (req, res) => {
  const league = await League.findOne({}).populate("standings.team");

  const fixtures = await Fixture.find({})
    .populate("teams.home")
    .populate("teams.away")
    .populate("goals");

  const { roundFixtures, currentRound } = getRoundFixtures(fixtures, 'Current');
  roundFixtures.sort(compareStartTimes);
  assignDateTime(roundFixtures);

  res.render("home", { league, roundFixtures, currentRound });
};

module.exports.updateStandings = async (req, res) => {
  const response = await requestStandings();
  res.send(response)
}

const assignDateTime = (fixtures) => {
  for (let f of fixtures) {
    const localMomentTime = moment.tz(f.date, 'Asia/Kuala_Lumpur');
    f.matchDate = localMomentTime.format("D MMM YYYY");
    f.matchTime = localMomentTime.format("hh:mm A");
  }
}

const compareStartTimes = (fixtureA, fixtureB) => {
  const startTimeA = moment.tz(fixtureA.date, 'YYYY-MM-DDTHH:mm:ssZ', 'Asia/Kuala_Lumpur');
  const startTimeB = moment.tz(fixtureB.date, 'YYYY-MM-DDTHH:mm:ssZ', 'Asia/Kuala_Lumpur');
  return startTimeA - startTimeB;
}



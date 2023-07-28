if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const moment = require("moment");

const League = require("../models/league");
const Fixture = require("../models/fixture");
const { getRoundFixtures } = require("../utilities/api/fixtureHelper");

module.exports.renderHomePage = async (req, res) => {
  const league = await League.findOne({}).populate("standings.team");

  const fixtures = await Fixture.find({})
    .populate("teams.home")
    .populate("teams.away")
    .populate("goals");

  const pastFixtures = getRoundFixtures(fixtures, 'Past');
  const currentFixtures = getRoundFixtures(fixtures, 'Current');
  const upcomingFixtures = getRoundFixtures(fixtures, 'Upcoming');

  assignDateTime(pastFixtures);
  assignDateTime(currentFixtures);
  assignDateTime(upcomingFixtures);

  res.render("home", { league, pastFixtures, currentFixtures, upcomingFixtures });
};

const assignDateTime = (fixtures) => {
  for (let f of fixtures) {
    f.matchDate = moment(f.date).format("D MMMM YYYY");
    f.matchTime = moment(f.date).format("hh:mm A");
  }
}

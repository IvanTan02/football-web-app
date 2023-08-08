const express = require('express');
const router = express.Router({ mergeParams: true });

const leagueController = require('../controllers/leagueController');
const fixtureController = require('../controllers/fixtureController')

router.route('/')
    .get(leagueController.renderHomePage);

router.route('/standings')
    .put(leagueController.updateStandings)

router.route('/fixtures')
    .put(fixtureController.updateFixtures);

module.exports = router;
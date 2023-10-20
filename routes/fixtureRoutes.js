const express = require('express');
const router = express.Router({ mergeParams: true });

const fixtureController = require('../controllers/fixtureController');

router.route('/')
    .get(fixtureController.renderFixturesPage)
    .put(fixtureController.updateFixtures)

router.route('/scheduled')
    .put(fixtureController.makeScheduledAPICall)

router.route('/:matchweek')
    .get(fixtureController.getFixtureByMatchweek)

module.exports = router;
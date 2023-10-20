const express = require('express');
const router = express.Router({ mergeParams: true });

const fixtureController = require('../controllers/fixtureController');

router.route('/')
    .get(fixtureController.renderFixturesPage)
    .put(fixtureController.updateFixtures)

router.route('/scheduled')
    .put(fixtureController.makeScheduledAPICall)

module.exports = router;
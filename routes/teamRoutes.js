const express = require('express');
const router = express.Router({ mergeParams: true });

const teamController = require('../controllers/teamController');

router.route('/')
    .get(teamController.renderTeamsIndex)
    .put(teamController.updateTeams);

router.route('/:id')
    .get(teamController.renderTeamDetails)
    .put(teamController.updateTeams);

module.exports = router;

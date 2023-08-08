const express = require('express');
const router = express.Router({ mergeParams: true });

const teamController = require('../controllers/teamController');

router.route('/')
    .get(teamController.renderTeamsIndex);

router.route('/:id')
    .get(teamController.renderTeamDetails)
    .put(teamController.updateTeam);

module.exports = router;

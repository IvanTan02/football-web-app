const express = require('express');
const router = express.Router({ mergeParams: true });

const teamController = require('../controllers/teamController');

router.route('/teams')
    .get(teamController.requestPLTeams);
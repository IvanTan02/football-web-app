const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');

// const { storeReturnTo } = require('../middleware');
const userController = require('../controllers/userController');
const { storeReturnTo } = require('../utilities/middleware');

router.route('/register')
    .get(userController.renderRegForm)
    .post(userController.registerUser)

router.route('/login')
    .get(userController.renderLoginForm)
    .post(passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
    }), userController.loginUser);

router.get('/logout', userController.logoutUser)

router.get('/admin', userController.renderAdminDashboard)

module.exports = router;
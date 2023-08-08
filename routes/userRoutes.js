const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');

const userController = require('../controllers/userController');
const { storeReturnTo, checkLogin } = require('../utilities/middleware');

router.route('/register')
    .get(userController.renderRegForm)
    .post(userController.registerUser)

router.route('/login')
    .get(userController.renderLoginForm)
    .post(storeReturnTo,
        passport.authenticate('local', {
            failureFlash: true,
            failureRedirect: '/login',
        }),
        userController.loginUser);

router.get('/logout', userController.logoutUser)

router.get('/admin', checkLogin, userController.renderAdminDashboard)

module.exports = router;
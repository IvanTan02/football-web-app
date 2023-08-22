const User = require('../models/user');
const Team = require('../models/team');

module.exports.renderRegForm = (req, res) => {
    res.render('users/register')
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const newUser = await User.register(user, password);
        req.login(newUser, (error) => {
            if (error) return next(error);
            req.flash('success', `Registration successful. Welcome, ${username}!`);
            res.redirect('/');
        })
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register')
    }
}

module.exports.loginUser = (req, res) => {
    const { username } = req.user;
    req.flash('success', `Welcome back, ${username}.`)
    const redirectUrl = res.locals.returnTo || '/';
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout(function (error) {
        if (error) return next(error)
        req.flash('success', 'Successfully logged you out.')
        res.redirect('/')
    })
}

module.exports.renderAdminDashboard = async (req, res) => {
    const teams = await Team.find({}).populate('league').populate('coaches').populate('squad');
    res.render('users/admin', { teams })
}
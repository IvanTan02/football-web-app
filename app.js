const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const http = require('http');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');

const { setLocalVariables } = require('./utilities/middleware');

const User = require('./models/user');

const leagueController = require('./controllers/leagueController');
const teamController = require('./controllers/teamController');
const fixtureController = require('./controllers/fixtureController');

const userRoutes = require('./routes/userRoutes');

const { dailyScheduler, fixtureScheduler } = require('./utilities/api/reqScheduler');
const { setupWebSocketServer } = require('./services/websocket');

// Database Connection Config
const dbUrl = 'mongodb://127.0.0.1:27017/football-app';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database connected.');
});

// Server and Websocket
const app = express();
const server = http.createServer(app);
setupWebSocketServer(server);

// Scheduled functions
// dailyScheduler();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'dev',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
app.use(flash());

// Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// STORE LOCAL VARIABLES
app.use(setLocalVariables);

app.use('/', userRoutes);

app.get('/home', leagueController.renderHomePage);
app.get('/teams', teamController.teamsIndex);
app.get('/teams/:id', teamController.showTeam);

app.put('/home/standings', leagueController.updateStandings);
app.put('/home/fixtures', fixtureController.updateFixtures);
app.put('/teams/:id/coaches', teamController.updateTeam);
app.put('/teams/:id/squad', teamController.updateTeam);

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

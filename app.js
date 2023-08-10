const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const http = require('http');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const MongoStore = require('connect-mongo');

const User = require('./models/user');

const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const homeRoutes = require('./routes/homeRoutes');

const { setLocalVariables } = require('./utilities/middleware');
const { setupWebSocketServer } = require('./services/websocket');
const { dailyScheduler } = require('./utilities/api/reqScheduler');

let dbUrl = process.env.MONGODB_CONNECT_STRING;
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    dbUrl = 'mongodb://127.0.0.1:27017/football-app';
}

// DB CONNECTION
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database connected.');
});

// SERVER AND WEBSOCKET
const app = express();
const server = http.createServer(app);
setupWebSocketServer(server);

// SET VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SESSION CONFIG
const secret = process.env.SECRET || 'dev-secret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
});
store.on('error', function (error) {
    console.log('Session store error', error)
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
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

// AUTHENTICATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// STORE LOCAL VARIABLES
app.use(setLocalVariables);

// ROUTERS
app.use('/', userRoutes);
app.use('/home', homeRoutes)
app.use('/teams', teamRoutes);

// HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    res.status(200).send('OK');
})

// RUN SCHEDULED FUNCTIONS
dailyScheduler();

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});

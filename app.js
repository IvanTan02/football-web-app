const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const http = require('http');

const leagueController = require('./controllers/leagueController');
const teamController = require('./controllers/teamController');

const { regularScheduler, fixtureScheduler } = require('./utilities/api/reqScheduler');
const { setupWebSocketServer } = require('./services/websocket');

const dbUrl = 'mongodb://127.0.0.1:27017/football-app'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // replicaSet: 'rs'
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database connected.')
})

const app = express();
const server = http.createServer(app);
setupWebSocketServer(server);

// fixtureScheduler();
// regularScheduler();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')))

app.get('/home', leagueController.renderHomePage);
app.get('/teams', teamController.teamsIndex);
app.get('/teams/:id', teamController.showTeam);

server.listen(3000, () => {
    console.log('Server listening on port 3000');
})
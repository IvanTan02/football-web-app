const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');

const leagueController = require('./controllers/leagueController');
const teamController = require('./controllers/teamController');

const dbUrl = 'mongodb://localhost:27017/football-app'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database connected.')
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')))

// app.get('/home', leagueController.getLeagueTable);
app.get('/teams', teamController.loadPLTeams);
app.get('/teams/:id', teamController.showTeam);

app.listen(3000, () => {
    console.log('Server listening on port 3000');
})
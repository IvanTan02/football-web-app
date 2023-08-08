const mongoose = require("mongoose");

const { requestCoach, requestSquad } = require("../api/teamHelpers");
const Team = require("../../models/team");

const dbUrl = "mongodb://0.0.0.0:27017/football-app";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
  console.log("Database connected.");
});

const seedTeams = async () => {
  try {
    const teams = await Team.find({}).populate('coaches').populate('squad');
    for (let i = 0; i < 10; i++) {
      await requestCoach(teams[i]);
      await requestSquad(teams[i]);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 2));

    for (let j = 10; j < 20; j++) {
      await requestCoach(teams[i]);
      await requestSquad(teams[i]);
    }
    console.log("The seeds have been planted.");
  } catch (error) {
    console.log(error)
  }

};

setTimeout(() => {
  seedTeams().then(() => {
    mongoose.connection.close();
  });
}, 3000);

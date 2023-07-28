const mongoose = require("mongoose");

const { requestCoach, requestSquad } = require("../utilities/api/teamHelpers");
const Team = require("../models/team");
const LastReqDates = require('../models/lastReqDates');

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

const seed = async () => {
  try {
    const teams = await Team.find({}).populate('coaches').populate('squad');
  for (let i = 7; i < 10; i++) {
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
  seed().then(() => {
    mongoose.connection.close();
  });
}, 3000);

// USE LATER
// const LastReqDates = await LastReqDates.findOne();
  // const currentDate = new Date();
  
// if (!lastReqDate.lastSquadReq || hasMonthsPassed(lastReqDate.lastSquadReq, currentDate, 1))
    // if (lastReqDate) {
        //     lastReqDate.lastSquadReq = currentDate;
        //     await lastReqDate.save();
        // } else {
        //     await LastReqDates.create({ lastSquadReq: currentDate });
        // }
        // } else {
        //     console.log('Request already executed this month. Skipping...');
        // }
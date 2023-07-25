const socketIO = require("socket.io");

const Team = require("../models/team");
const League = require("../models/league");
const Fixture = require("../models/fixture");

module.exports.setupWebSocketServer = (server) => {
  const io = socketIO(server);

  // Watching for changes to teams (Gonna remove later)
  const teamChangeStream = Team.watch();
  teamChangeStream.on("change", (change) => {
    console.log("Change detected");
    io.emit("teamChange", change);
  });
  teamChangeStream.on("error", (error) => {
    console.log("Error", error);
  });

  // Watching for changes to league standings
  const leagueChangeStream = League.watch();
  leagueChangeStream.on("change", async (change) => {
    if (change.operationType === "update") {
      console.log("League change detected", change);
      const updatedLeague = await getUpdatedLeagueTable();
      io.emit("leagueChange", updatedLeague);
    }
  });
  leagueChangeStream.on("error", (error) => {
    console.log("Error", error);
  });

  // Watching for changes to fixtures
  const fixtureChangeStream = Fixture.watch();
  fixtureChangeStream.on("change", (change) => {
    console.log("Fixture change detected");
    io.emit("fixtureChange", change);
  });
  fixtureChangeStream.on("error", (error) => {
    console.log("Error", error);
  });

  io.on("connection", (socket) => {
    console.log("Client connected");
    const message = "Hello client from server";
    socket.emit("message", message);

    // Socket.IO message event handler
    socket.on("message", (message) => {
      console.log("Received message:", message);
      // You can also broadcast the message to other connected clients if needed:
      // socket.broadcast.emit('message', message);
    });

    // Socket.IO disconnection event handler
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

const getUpdatedLeagueTable = async () => {
  return await League.findOne({}).populate("standings.team");
};

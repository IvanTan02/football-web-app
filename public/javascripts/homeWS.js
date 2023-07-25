const socket = io();

socket.on("connect", () => {
  console.log("Socket.IO connection opened");
});

socket.on("message", (message) => {
  console.log("Received message:", message);
});

socket.on("leagueChange", (updatedLeague) => {
  console.log("Received league change:");
  updateLeagueElement(updatedLeague);
});

socket.on("fixtureChange", (change) => {
  console.log("Received fixture change:", change);
  if (change.operationType === "update") updateFixtures(change);
});

socket.on("disconnect", () => {
  console.log("Socket.IO connection closed");
});

const message = "Hello server from client";
socket.emit("message", message);

const updateLeagueElement = (updatedLeague) => {
  const leagueTableBody = document.querySelector("#league-table tbody");
  if (leagueTableBody) {
    leagueTableBody.innerHTML = "";
    for (let position of updatedLeague.standings) {
      const row = `
        <tr>
        <th class="text-center" scope="row">${position.rank}</th>
        <td><img src="${position.team.logo}" alt="" style="height: 25px; width: 25px"
              class="me-1">${position.team.name}</td>
        <td>${position.all.played}</td>
        <td>${position.all.win}</td>
        <td>${position.all.draw}</td>
        <td>${position.all.lose}</td>
        <td>${position.all.goals.for}</td>
        <td>${position.all.goals.against}</td>
        <td>${position.goalsDiff}</td>
        <td>${position.points}</td>
        </tr>
       `;
      leagueTableBody.innerHTML += row;
    }
  }
};

const updateFixtures = (change) => {
  const fixtureId = change.documentKey._id;
  const updatedFields = change.updateDescription.updatedFields;
  const fixtureIndex = fixtures.findIndex(
    (fixture) => fixture._id === fixtureId
  );

  if (fixtureIndex !== -1) updateFixtureElement(fixtureId, updatedFields);
};

const updateFixtureElement = (fixtureId, updatedFields) => {
  const fixtureDiv = document.querySelector(`#fixture-${fixtureId}`);
  if (!fixtureDiv) return;
  if (!updatedFields) return;

  const homeGoals = updatedFields["goals.home"];
  const awayGoals = updatedFields["goals.away"];
  const status = updatedFields["status.long"];

  if (homeGoals !== undefined && homeGoals !== null && homeGoals !== "")
    fixtureDiv.querySelector("#home-goals").textContent = `${homeGoals}`;

  if (awayGoals !== undefined && awayGoals !== null && awayGoals !== "")
    fixtureDiv.querySelector("#away-goals").textContent = `${awayGoals}`;

  if (status)
    fixtureDiv.querySelector("#match-status").textContent = `${status}`;
};

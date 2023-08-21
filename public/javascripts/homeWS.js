const socket = io();

socket.on("connect", () => {
  console.log("Socket.IO connection opened");
});

socket.on("message", (message) => {
  console.log("Received message:", message);
});

socket.on("leagueChange", (updatedLeague) => {
  console.log("Received league change:", updatedLeague);
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
        <td class="text-center" scope="row">${position.rank}</td>
        <td><img src="${position.team.logo}" alt="" style="height: 25px; width: 25px"
              class="me-1">${position.team.name}</td>
        <td class="text-center">${position.all.played}</td>
        <td class="text-center">${position.all.win}</td>
        <td class="text-center">${position.all.draw}</td>
        <td class="text-center">${position.all.lose}</td>
        <td class="text-center">${position.all.goals.for}</td>
        <td class="text-center">${position.all.goals.against}</td>
        <td class="text-center">${position.goalsDiff}</td>
        <td class="text-center"><strong>${position.points}</strong></td>
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

  if (updatedFields && updatedFields.goals) {
    const goals = updatedFields.goals
    if (goals) {
      fixtureDiv.querySelector("#home-goals").textContent = `${goals.home}`;
      fixtureDiv.querySelector("#away-goals").textContent = `${goals.away}`
    }
  };

  if (updatedFields && updatedFields.status) {
    const status = updatedFields.status;
    if (status) {
      fixtureDiv.querySelector("#match-status").textContent = `${status.long}`;
    }
  }
};

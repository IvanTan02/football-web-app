const socket = io();

socket.on("connect", () => {
  console.log("Socket.IO connection opened");
});

socket.on("message", (message) => {
  console.log("Received message:", message);
});

socket.on("teamChange", (change) => {
  console.log("Received team change:", change);
  if (change.operationType === "update") updateTeams(change);
});

socket.on("disconnect", () => {
  console.log("Socket.IO connection closed");
});

const message = "Hello server from client";
socket.emit("message", message);

function updateTeams(change) {
  const teamId = change.documentKey._id;
  const updatedFields = change.updateDescription.updatedFields;
  const teamIndex = teams.findIndex((team) => team._id === teamId);

  if (teamIndex !== -1) updateTeamElement(teamId, updatedFields);
}

function updateTeamElement(teamId, updatedFields) {
  const teamDiv = document.getElementById(`team-${teamId}`);
  if (!teamDiv) return;

  if (updatedFields.name)
    teamDiv.querySelector(".card-title").textContent = updatedFields.name;

  if (updatedFields.logo)
    teamDiv.querySelector(".card-img-top").src = updatedFields.logo;
}

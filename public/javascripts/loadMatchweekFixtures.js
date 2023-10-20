


const matchweekSelect = document.querySelector('#matchweek-selector');
const fixtureContainer = document.querySelector('#fixture-container');

matchweekSelect.addEventListener('change', async () => {
  const selectedMatchweek = matchweekSelect.value;
  console.log(selectedMatchweek)

  if (selectedMatchweek === 'Select Matchweek') {

  } else {
    console.log(selectedMatchweek)
    const res = await axios.get(`/fixtures/${selectedMatchweek}`);
    const fixtures = res.data;
    fixtureContainer.innerHTML = '';

    for (let fixture of fixtures) {
      const fixtureHTML = generateFixtureHTML(fixture);
      fixtureContainer.appendChild(fixtureHTML);
    }
  }
})

const generateFixtureHTML = (fixture) => {

  // Fixture Container HTML
  const fixtureElement = document.createElement('div');
  fixtureElement.className = 'row mb-2 fixture-box box-shadow-rounded';
  fixtureElement.id = 'fixture-' + fixture._id;

  // Home Team HTML
  const homeTeamElement = document.createElement('div');
  homeTeamElement.className = 'col-4 text-center d-flex flex-column align-items-center justify-content-center home-team';
  homeTeamElement.innerHTML = `
    <img src="${fixture.teams.home.logo}" alt="" class="team-logo mb-1" />
    <p>${fixture.teams.home.name}</p>
  `;

  // Game Details HTML
  const gameDetailsElement = document.createElement('div');
  gameDetailsElement.className = 'col-4 text-center d-flex flex-column align-items-center justify-content-center game-details';
  gameDetailsElement.innerHTML = `
    <p><span class="badge rounded-pill purple-badge">${fixture.status.long}</span></p>
    <h5>
      <span id="home-goals">${fixture.goals.home}</span> - 
      <span id="away-goals">${fixture.goals.away}</span>
    </h5>
    <p>${fixture.formattedDate.matchDate}</p>
    <p>${fixture.formattedDate.matchTime}</p>
  `;

  // Away Team HTML
  const awayTeamElement = document.createElement('div');
  awayTeamElement.className = 'col-4 text-center d-flex flex-column align-items-center justify-content-center away-team';
  awayTeamElement.innerHTML = `
    <img src="${fixture.teams.away.logo}" alt="" class="team-logo mb-1" />
    <p>${fixture.teams.away.name}</p>
  `;

  // Append elements to the fixture container
  fixtureElement.appendChild(homeTeamElement);
  fixtureElement.appendChild(gameDetailsElement);
  fixtureElement.appendChild(awayTeamElement);

  return fixtureElement;
}


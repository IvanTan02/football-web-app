
const updateAllCoachesBtn = document.querySelector('#update-all-coach-btn');
const updateAllSquadsBtn = document.querySelector('#update-all-squads-btn');

const updateCoachesBtn = document.querySelector('#update-coaches-btn');
const updateSquadsBtn = document.querySelector('#update-squads-btn');

const updateStandingsBtn = document.querySelector('#update-standings-btn');
const updateFixturesBtn = document.querySelector('#update-fixtures-btn');
const updateAllFixturesBtn = document.querySelector('#update-all-fixtures-btn');

const updateStatus = document.querySelector('#update-status')

const teamSelect = document.querySelector('#team-select')
const matchweek = document.querySelector('#matchweek')

const TeamUpdateOptions = {
    COACHES: 'Coaches',
    SQUAD: 'Squad',
}

updateAllCoachesBtn.addEventListener('click', () => { updateAllTeams('Coaches') });

updateAllSquadsBtn.addEventListener('click', () => { updateAllTeams('Squad') });

updateCoachesBtn.addEventListener('click', () => { updateSpecificTeam('Coaches') });

updateSquadsBtn.addEventListener('click', () => { updateSpecificTeam('Squad') })

updateStandingsBtn.addEventListener('click', () => {
    makeAPIRequest('/standings');
});

updateAllFixturesBtn.addEventListener('click', () => {
    makeAPIRequest('/fixtures');
})

updateFixturesBtn.addEventListener('click', () => {
    if (isNaN(matchweek.value)) return updateStatus.innerText = 'Matchweek must be a number!';
    const data = {
        matchweek: matchweek.value
    }
    makeAPIRequest('/fixtures', data);

})

const updateAllTeams = (updateOption) => {
    const data = {
        updateOption: updateOption
    }
    switch (updateOption) {
        case TeamUpdateOptions.COACHES:
            makeAPIRequest(`/teams`, data);
            break;
        case TeamUpdateOptions.SQUAD:
            makeAPIRequest(`/teams`, data);
            break;
    }
}

const updateSpecificTeam = (updateOption) => {
    if (teamSelect.value === 'null') return;
    const data = {
        teamId: teamSelect.value,
        updateOption: updateOption
    }
    switch (updateOption) {
        case TeamUpdateOptions.COACHES:
            makeAPIRequest(`/teams/${teamSelect.value}`, data);
            break;
        case TeamUpdateOptions.SQUAD:
            makeAPIRequest(`/teams/${teamSelect.value}`, data);
            break;
    }
}

const makeAPIRequest = (route, data = null) => {
    axios.put(route, data)
        .then((response) => {
            updateStatus.innerText = response.data;
        })
        .catch((error) => {
            updateStatus.innerText = error;
        })
}
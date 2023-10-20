
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

updateCoachesBtn.addEventListener('click', () => { updateTeam('Coaches') });

updateSquadsBtn.addEventListener('click', () => { updateTeam('Squad') })

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

const updateTeam = (updateOption) => {
    if (teamSelect.value === 'null') return;
    const data = {
        teamId: teamSelect.value,
        updateOption: updateOption
    }
    switch (updateOption) {
        case TeamUpdateOptions.COACHES:
            makeAPIRequest(`/teams/${teamSelect.value}/coaches`, data);
            break;
        case TeamUpdateOptions.SQUAD:
            makeAPIRequest(`/teams/${teamSelect.value}/squad`, data);
            break;
    }
}

const makeAPIRequest = (route, data = null) => {
    axios.put(route, data)
        .then((response) => {
            updateStatus.innerText = response.data.message;
        })
        .catch((error) => {
            updateStatus.innerText = error;
        })
}
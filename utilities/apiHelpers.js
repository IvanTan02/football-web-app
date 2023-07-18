const requestPLTeams = async () => {
    try {
        const lastReqDate = await LastReqDates.findOne();
        const currentDate = new Date();

        if (!lastReqDate || hasMonthPassed(lastReqDate.lastPLTeamsReq, currentDate)) {
            const teamReq = {
                method: 'GET',
                url: 'https://v3.football.api-sports.io/teams',
                params: { league: '39', season: '2023' },
                headers: {
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                    'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
                },
            };

            console.log('Making request')
            const result = await axios(teamReq);
            console.dir(result.data.response);
            const teams = result.data.response;

            for (let team of teams) {
                const newTeam = new Team(team);
                await newTeam.save();
            }

            console.log('Teams saved successfully');

            if (lastReqDate) {
                lastReqDate.lastPLTeamsReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastPLTeamsReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}

const requestCoach = async (teamId) => {
    try {
        const lastReqDate = await LastReqDates.findOne();
        const currentDate = new Date();

        if (!lastReqDate || hasMonthPassed(lastReqDate.lastPLTeamsReq, currentDate)) {
            const team = await Team.findById(teamId);
            const options = makeReqObject('coachs', { team: `${team.team.id}` });
            const result = await axios(options);
            console.dir(result.data.response[0]);
            team.coach = result.data.response[0];
            await team.save();
            console.log('Saved maybe?')
            console.log(team.coach);

            if (lastReqDate) {
                lastReqDate.lastPLTeamsReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastPLTeamsReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}

const requestSquad = async (team) => {
    try {
        const lastReqDate = await LastReqDates.findOne();

        if (!lastReqDate || hasMonthPassed(lastReqDate.lastPLTeamsReq, currentDate)) {
            const options = makeReqObject('players/squads', { team: `${team.team.id}` });
            const result = await axios(options);
            console.dir(result.data.response[0].players);
            const players = result.data.response[0].players;
            for (let p of players) {
                const player = new Player(p);
                await player.save();
                team.squad.push(player);
                await team.save();
            }
            console.log('Saved maybe?')
            console.log(team.squad);

            if (lastReqDate) {
                lastReqDate.lastPLTeamsReq = currentDate;
                await lastReqDate.save();
            } else {
                await LastReqDates.create({ lastPLTeamsReq: currentDate });
            }
        } else {
            console.log('Request already executed this month. Skipping...');
        }
    } catch (e) {
        console.log(e);
    }
}

const makeReqObject = (endpoint, params) => {
    const reqObject = {
        method: 'GET',
        url: `https://v3.football.api-sports.io/${endpoint}`,
        params: params,
        headers: {
            'x-rapidapi-host': 'v3.football.api-sports.io',
            'x-rapidapi-key': process.env.API_FOOTBALL_KEY,
        }
    }
    return reqObject;
}

const hasMonthPassed = (lastDate, currentDate) => {
    const diffInMonths = (currentDate.getFullYear() - lastDate.getFullYear()) * 12 + (currentDate.getMonth() - lastDate.getMonth());
    return diffInMonths >= 1;
}
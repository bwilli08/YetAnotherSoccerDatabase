/* eslint-disable no-undef */
function club_search(cb) {
    return club_search_with_name(null, cb);
}

function club_search_with_name(club, cb) {
    const params = club ? `?name=${club}` : "";

    return fetch(`/search/clubs${params}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function club_match_stats(match_id, cb) {
    return fetch(`/get/match-stats?match_id=${match_id}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function match_lineup(match_id, cb) {
    return fetch(`/get/lineup?match_id=${match_id}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function club_match_search(club1, club2, cb) {
    const club1param = `&club1=${club1}`;
    var club2param = "";
    if (club2) {
        club2param = `&club2=${club2}`;
    }

    return fetch(`/search/matches?type=club${club1param}${club2param}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function club_seasons(query, cb) {
    return fetch(`/search/club-season?club_id=${query}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function player_search(query, position, cb) {
    var qry = `/search/players?name=${query}`;

    if (position) {
        qry = qry.concat(`&position=${position}`);
    }

    return fetch(qry, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function stat_search(query, cb) {
    return fetch(`/search/player-season?player_id=${query}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
}

function parseJSON(response) {
    return response.json();
}

const Client = {match_lineup, club_search, club_match_stats, club_seasons, club_match_search, player_search, stat_search, club_search_with_name};
export default Client;

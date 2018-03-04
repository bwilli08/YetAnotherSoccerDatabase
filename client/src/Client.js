/* eslint-disable no-undef */
function club_search(query, cb) {
    return fetch(`/search/clubs?name=${query}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function club_stats(query, cb) {
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

const Client = {club_search, club_stats, player_search, stat_search};
export default Client;

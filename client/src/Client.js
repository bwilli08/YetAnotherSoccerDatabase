/* eslint-disable no-undef */
function player_search(query, cb) {
    return fetch(`/search/players?name=${query}`, {
        accept: "application/json"
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(cb);
}

function stat_search(query, cb) {
    return fetch(`/player-stats?id=${query}`, {
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

const Client = {player_search, stat_search};
export default Client;

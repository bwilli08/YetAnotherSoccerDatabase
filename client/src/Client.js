/* eslint-disable no-undef */
function club_search(cb) {
    return club_search_with_name(null, cb);
}

function club_search_with_name(club, cb) {
    const params = club ? `?name=${club}` : "";

    return json_query(`/search/clubs${params}`, cb);
}

function get_seasons(cb) {
    return json_query("/get/seasons", cb);
}

function clubs_for_season(season_id, cb) {
    return json_query(`/search/clubs?season_id=${season_id}`, cb);
}

function get_readme(cb) {
    return text_query("/readme", cb);
}

function club_match_stats(match_id, cb) {
    return json_query(`/get/match-stats?match_id=${match_id}`, cb);
}

function match_lineup(match_id, cb) {
    return json_query(`/get/lineup?match_id=${match_id}`, cb);
}

function season_lineup(season_id, club_id, cb) {
    return json_query(`/get/lineup?season_id=${season_id}&club_id=${club_id}`, cb);
}

function club_match_search(club1, club2, cb) {
    const club1param = `&club1=${club1}`;
    var club2param = "";
    if (club2) {
        club2param = `&club2=${club2}`;
    }

    return json_query(`/search/matches?type=club${club1param}${club2param}`, cb);
}

function club_seasons(query, cb) {
    return json_query(`/search/club-season?club_id=${query}`, cb);
}

function player_search(query, position, cb) {
    var qry = `/search/players?name=${query}`;

    if (position) {
        qry = qry.concat(`&position=${position}`);
    }

    return json_query(qry, cb);
}

function stat_search(query, cb) {
    return json_query(`/search/player-season?player_id=${query}`, cb);
}

function overview_search(type, stat, order, year, cb) {
    var qry = `/top10/${type}?stat=${stat}`;

    if (order) {
        qry = qry.concat(`&order=${order}`)
    }

    if (year) {
        qry = qry.concat(`&year=${year}`)
    }

    return json_query(qry, cb);
}

function player_graph_data(stat, year, cb) {
    return json_query(`/get/player-stats?stat=${stat}&year=${year}`, cb);
}

function predict(season_id, home_club_id, home_players, away_club_id, away_players, cb) {
    const params = [
        `season_id=${season_id}`,
        `home_club_id=${home_club_id}`,
        `home_players=${home_players.join()}`,
        `away_club_id=${away_club_id}`,
        `away_players=${away_players.join()}`
    ];

    return json_query(`/predict?${params.join('&')}`, cb)
}

function json_query(qry, cb) {
    const type = {
        accept: "application/json",
        parse: parseJSON
    };

    return query(qry, type, cb);
}

function text_query(qry, cb) {
    const type = {
        accept: "text/plain",
        parse: parseText
    };

    return query(qry, type, cb);
}

function query(qry, type, cb) {
    return fetch(qry, {
        accept: type.accept
    })
        .then(checkStatus)
        .then(type.parse)
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

function parseText(response) {
    return response.text();
}

const Client = {
    overview_search,
    get_readme,
    match_lineup,
    club_search,
    club_match_stats,
    club_seasons,
    club_match_search,
    player_search,
    stat_search,
    club_search_with_name,
    player_graph_data,
    season_lineup,
    get_seasons,
    clubs_for_season,
    predict
};
export default Client;

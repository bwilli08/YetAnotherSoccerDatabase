const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const db_info = require('./internal/database-info');

const db = mysql.createConnection({
    host: db_info.db_host(),
    user: db_info.db_user(),
    password: db_info.db_passwd(),
    database: db_info.db_name(),
    dateStrings: true
});

const outfield_positions = ["FW", "MF", "DF"];
const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

app.get("/search/club-season", (req, res) => {
    const club_id = req.query.club_id;

    if (!club_id) {
        res.json({
            error: "Missing required parameter `club_id`"
        });
        return;
    }

    const qry =
        `SELECT *
        FROM
            ClubSeason
                LEFT JOIN
            (SELECT club_id, club_name, country as club_country FROM Club) club USING (club_id)
                JOIN
            (SELECT comp_id, comp_name, year, country as comp_country FROM Competition) comp USING (comp_id)
        WHERE club_id=${club_id}
        ORDER BY year DESC`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/search/player-season", (req, res) => {
    const player_id = req.query.player_id;

    if (!player_id) {
        res.json({
            error: "Missing required parameter `player_id`"
        });
        return;
    }

    const qry =
        `SELECT
            competition.name as comp_name,
            season.year as year,
            country.name as country_name,
            club.name as club_name,
            stats.appearances as apps,
            stats.appearances - stats.sub_apps as starts,
            stats.sub_apps as subs,
            stats.minutes_played as minutes,
            stats.goals as goals,
            stats.assists as assists,
            stats.yellow_cards as yellows,
            stats.yellow_red as double_yellows,
            stats.red_cards as reds
        FROM
            (SELECT * FROM PlayerSeason WHERE player_id = ${player_id}) stats
                JOIN
            Season season ON stats.season_id = season.id
                JOIN
            Competition competition ON season.league_id = competition.id
                JOIN
            Country country ON competition.country_id = country.id
                JOIN
            Club club ON stats.club_id = club.id
        ORDER BY season.year ASC;`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/search/clubs", (req, res) => {
    const name = req.query.name;

    if (!name) {
        res.json({
            error: "Missing required parameter `name`"
        });
        return;
    }

    const qry =
        `SELECT
            club.id as club_id,
            club.name as club_name,
            country.id as country_id,
            country.name as country_name,
            country.continent as continent,
            venue.name as venue_name,
            venue.city as venue_city,
            venue.capacity as venue_capacity
        FROM
            (SELECT * FROM Club WHERE name LIKE '%${name}%') club
                JOIN
            Country country ON club.country_id = country.id
                JOIN
            Venue venue ON club.venue_id = venue.id
        ORDER BY club.name ASC`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/search/players", (req, res) => {
    const name = req.query.name;
    const position = req.query.position;

    if (!name) {
        res.json({
            error: "Missing required parameter `name`"
        });
        return;
    }

    const name_string = name.replace(" ", "%");

    var select_player_qry = `SELECT * FROM Player WHERE name LIKE '%${name_string}%'`;
    var select_position_qry = `SELECT * FROM Position`;
    if (position) {
        select_position_qry = select_position_qry.concat(` WHERE name = '${position}'`);
    }

    const qry =
        `SELECT
            player.id as player_id,
            player.name as player_name,
            player.nickname as player_nickname,
            player.nationality as player_nationality,
            position.name as position,
            player.birthdate as player_birthdate,
            player.height as player_height,
            player.weight as player_weight
        FROM
            (${select_player_qry}) player
                JOIN
            (${select_position_qry}) position ON player.position_id = position.id
        ORDER BY player.name ASC`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

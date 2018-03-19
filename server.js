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
        `SELECT
          *
        FROM
          (SELECT *
           FROM ClubSeasonStats
           WHERE club_id = ${club_id}) clubSeason
          LEFT JOIN
          Season season ON clubSeason.season_id = season.id
          JOIN
          Competition comp ON season.league_id = comp.id
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
        ORDER BY season.year DESC`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/search/clubs", (req, res) => {
    const name = req.query.name;

    var qry;
    if (!name) {
        qry = "SELECT * FROM Club";
    } else {
        qry =
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
    }

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

app.get("/get/match-stats", (req, res) => {
    const match_id = req.query.match_id;

    if (!match_id) {
        res.json({
            error: "Missing required parameter `match_id`."
        });
        return;
    }

    qry = `
    SELECT
        club_id,
        SUM(goals_scored) as goals,
        SUM(shots_on_goal) as shots_on_goal,
        SUM(shots_total) as shots,
        SUM(fouls_committed) as fouls,
        SUM(interceptions) as interceptions,
        SUM(saves) as saves,
        SUM(clearances) as clearances,
        SUM(tackles) as tackles,
        SUM(offsides) as offsides,
        SUM(blocks) as blocks,
        SUM(passes_total) as passes,
        SUM(crosses_total) as crosses,
        SUM(yellow_cards) as yellow_cards,
        SUM(red_cards) as red_cards
    FROM
        (SELECT * FROM PlayerGame WHERE fixture_id = ${match_id}) lineup,
        Player p
    WHERE lineup.player_id = p.id
    GROUP BY club_id`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/get/lineup", (req, res) => {
    const match_id = req.query.match_id;

    if (!match_id) {
        res.json({
            error: "Missing required parameter `match_id`."
        });
        return;
    }

    const qry = `
    SELECT *
    FROM
        (SELECT * FROM PlayerGame WHERE fixture_id = ${match_id}) lineup,
        Player p
    WHERE lineup.player_id = p.id`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/search/matches", (req, res) => {
    const type = req.query.type;

    if (!type) {
        res.json({
            error: "Missing required parameter `type`, should be either 'club' or 'player'."
        });
        return;
    }

    if (type === "club") {
        const club1 = req.query.club1;
        const club2 = req.query.club2;

        if (!club1) {
            res.json({
                error: "You have to specify at least one team."
            });
            return;
        }

        var qry =
            `SELECT
                team1.id as match_id,
                team1.home_team_id as home_team_id,
                team1.away_team_id as away_team_id,
                team1.home_team_score,
                team1.away_team_score,
                date(team1.date_of_game) as date_of_game,
                v.name as venue,
                s.year,
                c.name as league
            FROM (SELECT * FROM Fixture WHERE home_team_id = ${club1} OR away_team_id = ${club1}) team1`;

        if (club2) {
            qry = qry.concat(`, (SELECT * FROM Fixture WHERE home_team_id = ${club2} OR away_team_id = ${club2}) team2`);
        }

        qry = qry.concat(", Venue v, Season s, Competition c WHERE team1.venue_id = v.id AND team1.season_id = s.id AND s.league_id = c.id");

        if (club2) {
            qry = qry.concat(" AND team1.id = team2.id");
        }

        qry = qry.concat(" ORDER BY date_of_game DESC");

        db.query(qry, function (err, result) {
            if (err) throw err;

            res.json(result);
        });

    } else if (type === "player") {
        const player_id = req.query.player_id;

        if (!player_id) {
            res.json({
                error: "You have to specify a player."
            });
            return;
        }

        const qry = `SELECT *
                            FROM
                                (SELECT * FROM PlayerGame WHERE player_id = 323) game,
                                Season s,
                                Club c,
                                Competition comp
                            WHERE s.league_id = comp.id AND game.season_id = s.id AND game.club_id = c.id`;

        db.query(qry, function (err, result) {
            if (err) throw err;

            res.json(result);
        });
    } else {
        res.json({
            error: "Invalid parameter `type`, must be either 'club' or 'player'."
        });
        return;
    }
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

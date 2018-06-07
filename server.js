const spawn = require('child_process').spawn;
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

app.get("/get/seasons", (req, res) => {
    const qry =
        `select s.*, c.name, country.name as country
         FROM Season s,
            Competition c,
            Country country
         WHERE s.league_id=c.id AND c.id!=0 AND s.year in ('2016/2017', '2017/2018') AND c.country_id=country.id
         ORDER BY s.year DESC, c.name ASC`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

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
    const season_id = req.query.season_id;

    var qry;
    if (name) {
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
                Venue venue ON club.venue_id = venue.id`;
    } else if (season_id) {
        qry = `SELECT *
               FROM (SELECT * FROM ClubSeason WHERE season_id = ${season_id}) league
                    JOIN
               Club club ON league.club_id=club.id`;
    } else {
        qry = "SELECT * FROM Club club";
    }

    qry = qry.concat(" ORDER BY club.name ASC");

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

app.get("/get/player-stats", (req, res) => {
    const year = req.query.year;
    const stat = req.query.stat;

    if (!year) {
        res.json({
            error: "Missing required parameter `year`."
        });
        return;
    }

    if (!stat) {
        res.json({
            error: "Missing required parameter `stat`."
        });
        return;
    }

    const qry = `
    SELECT *
    FROM
        (
            SELECT player_id, games, ${stat} as total
            FROM PlayerStatsByYear
            WHERE year=${year.replace("/", "")}
        ) stats,
        (
            SELECT id, nickname as name
            FROM Player
        ) p
    WHERE stats.player_id=p.id
    ORDER BY stats.total DESC`;

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

    qry =
        `SELECT
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
    const season_id = req.query.season_id;
    const club_id = req.query.club_id;

    if (match_id) {
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
    } else {
        const qry = `
            SELECT p.id, p.nickname, p.nationality, pos.position FROM
                (SELECT player_id
                FROM PlayerSeason
                WHERE club_id=${club_id} AND season_id=${season_id}) lineup,
                Player p,
                (SELECT id, name as position FROM Position) pos
            WHERE p.id=lineup.player_id AND p.position_id=pos.id`;

        db.query(qry, function (err, result) {
            if (err) throw err;

            res.json(result);
        });
    }
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

app.get("/top10/player", (req, res) => {
    const stat = req.query.stat;
    var order = req.query.order;
    const year = req.query.year;

    if (!stat) {
        res.json({
            error: "You have to specify a stat to display top players for."
        });
        return;
    }

    if (!order) {
        order = "DESC";
    }

    const valid_stats = [
        "goals",
        "assists",
        "shots_on_goal",
        "shots",
        "fouls_committed",
        "fouls_drawn",
        "interceptions",
        "saves",
        "clearances",
        "tackles",
        "offsides",
        "blocks",
        "yellow_cards",
        "red_cards"
    ];
    if (!valid_stats.includes(stat)) {
        res.json({
            error: `Invalid stat, must be one of [${valid_stats}].`
        });
        return;
    }

    var qry = `SELECT
                    name,
                    nationality,
                    SUM(${stat}) as total
                FROM PlayerStatsByYear `;

    if (year) {
        qry = qry.concat(`WHERE year=${year.replace("/", "")} `)
    }

    qry = qry.concat(`GROUP BY player_id ORDER BY total ${order} LIMIT 10`);

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/top10/club", (req, res) => {
    const stat = req.query.stat;
    var order = req.query.order;
    const year = req.query.year;

    if (!stat) {
        res.json({
            error: "You have to specify a stat to display top clubs for."
        });
        return;
    }

    if (!order) {
        order = "DESC";
    }

    const valid_stats = ["goals_for_total", "goals_against_total", "clean_sheet_total", "failed_to_score_total"];
    if (!valid_stats.includes(stat)) {
        res.json({
            error: `Invalid stat, must be one of [${valid_stats}].`
        });
        return;
    }

    const qry = `SELECT club.name as club,
                    country.name as country,
                    best.total as total
                 FROM Club club,
                    Country country,
                    (SELECT club_id,
                        SUM(${stat}) as total
                    FROM ClubSeasonStats css, Season s
                    WHERE css.season_id=s.id AND s.year='${year}'
                    GROUP BY club_id) best
                 WHERE club.country_id=country.id
                    AND club.id=best.club_id
                 ORDER BY best.total ${order}
                 LIMIT 10`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.get("/predict", (req, res) => {
    const season_id = req.query.season_id;
    const home_club_id = req.query.home_club_id;
    const home_players = req.query.home_players;
    const away_club_id = req.query.away_club_id;
    const away_players = req.query.away_players;

    const proc = spawn('python3', ["prediction-script.py", season_id, home_club_id, home_players, away_club_id, away_players]);

    let result;

    proc.stdout.on('data', (data) => {
        const dataArray = data.toString().split("\n");

        const outcomeProbabilities = JSON.parse(dataArray[0]);
        const likelyScore = JSON.parse(dataArray[1]);

        result = {"outcome": outcomeProbabilities, "score": likelyScore};
    });

    proc.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    proc.on('close', (code) => {
        res.json(result);
    });
});

app.get("/readme", (req, res) => {
    fs.readFile("./README.md", {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(data);
        } else {
            console.log(err);
        }
    });
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

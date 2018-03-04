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
        `SELECT *
        FROM
            PlayerSeason
                LEFT JOIN
            (SELECT club_id, club_name, country as club_country FROM Club) club USING (club_id)
                JOIN
            (SELECT comp_id, comp_name, year, country FROM Competition) c USING (comp_id)
        WHERE player_id = ${player_id}`;

    db.query(position_qry, function (err, result) {
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

    const qry = `SELECT * FROM Club WHERE club_name LIKE '%${name}%'`;

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

    var qry = `SELECT * FROM Player WHERE name LIKE '%${name}%'`;

    if (position) {
        qry = qry.concat(` AND position='${position}'`);
    }

    qry = qry.concat(" ORDER BY name ASC");

    db.query(qry, function (err, result) {
        if (err) throw err;

        res.json(result);
    });
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

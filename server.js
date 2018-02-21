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

function getPlayer(req, res) {
    const player_id = req.query.id;
    const attribute = req.query.attr;

    if (!player_id) {
        res.json({
            error: "Missing required parameter `id`"
        });
        return;
    }

    const position_qry = `SELECT * FROM Player WHERE player_id=${player_id}`;

    db.query(position_qry, function (err, result) {
        if (err) throw err;

        if (attribute) {
            res(result[0][attribute]);
        } else {
            res(result[0]);
        }
    });
}

function decideStatTable(position, cb) {
    if (outfield_positions.indexOf(position) >= 0) {
        cb("OutfieldPlayerStat");
    } else if (position == "GK") {
        cb("GoalkeeperStat");
    } else {
        console.log(`Unknown player position`);
        return;
    }
}

app.get("/player", (req, res) => {
    getPlayer(req, (result) => res.json(result));
});

app.get("/player-clubs", (req, res) => {
    const player_id = req.query.id;

    if (!player_id) {
        res.json({
            error: "Missing required parameter `id`"
        });
        return;
    }

    req.query.attr = "position";
    getPlayer(req, (result) => {
        const position = result;

        decideStatTable(position, (table) => {
            const qry = `SELECT club_name
            FROM   (SELECT season_id
                    FROM ${table}
                    WHERE player_id=${player_id}) s
                LEFT JOIN
                    (SELECT club_name, season_id
                     FROM   Club
                     LEFT JOIN
                            ClubSeason
                     USING (club_id)) c
                USING (season_id)
            GROUP BY club_name
            ORDER BY COUNT(*) DESC`;

            db.query(qry, function (err, result) {
                if (err) throw err;
                res.json(result);
            });
        });
    });
});

app.get("/player-stats", (req, res) => {
    const id = req.query.id;

    if (!id) {
        res.json({
            error: "Missing required parameter `id`"
        });
        return;
    }

    req.query.attr = "position";
    getPlayer(req, (result) => {
        const position = result;

        decideStatTable(position, (table) => {
            db.query(`
            SELECT *
            FROM
                ${table}
            LEFT JOIN
                (SELECT *
                FROM Club
                LEFT JOIN
                ClubSeason
                USING (club_id)) club
            USING (season_id)
            WHERE player_id=${id}
            ORDER BY club.season ASC`,
                function (err, result) {
                    if (err) throw err;
                    res.json(result);
                });
        });
    });
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

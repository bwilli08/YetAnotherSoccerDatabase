const express = require("express");
const fs = require("fs");
const mysql = require("mysql");
const db_info = require('./internal/database-info');

const db = mysql.createConnection({
    host: db_info.db_host(),
    user: db_info.db_user(),
    password: db_info.db_passwd(),
    database: db_info.db_name()
});

const app = express();

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

app.get("/search/teams", (req, res) => {
    const name = req.query.name;

    if (!name) {
        res.json({
            error: "Missing required parameter `name`"
        });
        return;
    }

    qry = `SELECT * FROM Club WHERE squad LIKE '${name}%'`;

    console.log(qry);

    db.query(qry, function (err, result) {
        if (err) throw err;
        console.log(result);

        res.json(result);
        return
    });
});


app.get("/search/players", (req, res) => {
    const name = req.query.name;

    if (!name) {
        res.json({
            error: "Missing required parameter `name`"
        });
        return;
    }

    qry = `SELECT * FROM Player WHERE name LIKE '${name}%'`;

    console.log(qry);

    db.query(qry, function (err, result) {
        if (err) throw err;
        console.log(result);

        res.json(result);
        return
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

    qry = `SELECT position FROM Player WHERE player_id='${id}'`;

    db.query(qry, function (err, result) {
        if (err) throw err;

        console.log("Length: " + result.length);

        const position = ((result.length > 0) ? result[0]['position'] : "Invalid");

        console.log("Position: " + position);

        if (position == "Invalid") {
            res.json({
                error: `Unknown player id: ${id}`
            });
            return;
        }

        const table = (position == "GK") ? "GoalkeeperStat" : "OutfieldPlayerStat";

        db.query(`SELECT * FROM ${table} WHERE player_id=${id}`,
            function (err, result) {
                if (err) throw err;
                console.log("Result: " + result);

                res.json(result)
                return;
            });
    });
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

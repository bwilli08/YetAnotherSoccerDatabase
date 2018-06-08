# Yet Another Soccer Database

## Table of Contents
- [Technologies and Sources](#technologies-and-sources)
- [Setup](#setup)
- [Deprecated Scripts](#deprecated-scripts)

## Technologies and Sources
#### Data Source
The backing data source is a Soccer API called [Sports Monks](https://www.sportmonks.com). They have country, competition, club, and player information from 1992 onward. Their dataset also includes scores from fixtures during that period, but only has in-depth fixture statistics (shots-on-target, passing, etc.) for the past two seasons. Because of this difference in available data, I've only retrieved fixture information for the 2016-17 and 2017-18 seasons.

The ETL process was implemented in Python, and can be viewed under `scripts/sports_monks.py`.

#### Local Database
The local database, using the MySQL DBMS, almost mirrors the dataset retrieved by Sports Monks. However, due to missing/optional information about some clubs, competitions, and players, some of the data in the local database has been calculated. For example, the PlayerSeason table has been generated by joining the Player and PlayerGame tables and grouping by player, competition, and club.

The Relation Schema, modelled as the MySQL create table statements, can be viewed under `configuration/sports_monks_db.sql`.

#### Back End Server
* Node
    * [Express](https://expressjs.com/) - Web server technology

#### Front End Web App
* React
    * [React Router](https://github.com/ReactTraining/react-router) - Used to ease page navigation.
    * [Reactstrap](https://github.com/reactstrap/reactstrap) - Pre-made components that are aesthetic and functional

## Setup
1. Backfill the Sports Monks data.
1. Start the backend server.
1. Start the frontend web application.

#### Backfilling Sports Monks Data
1. Ensure you have pandas, mysqlconnector, and sqlalchemy installed for python3.
    * If you don't, try the following command: `pip3 install pandas sqlalchemy mysql-connector`
1. Run the CREATE TABLE statements found in `configuration/sports_monks_db.sql`.
1. Create the `internal/` directory and the following files. DO NOT COMMIT ANYTHING IN THIS FOLDER.
    1. Create a file named `sports_monks_tok.py`. It should contain a single method, `sports_monks_token()`, that returns the API token you've created with Sports Monks.
    1. Create a file named `databaseinfo.py`. It should contain the following methods:
        * `db_user()`: Return the DB user name
        * `db_passwd()`: Return the DB password
        * `db_host()`: Return the host that the DB is running on
        * `db_name()`: Return tahe name of the database, probably "SportsMonksDB".
1. Run `scripts/sports_monks.py`, then run `scripts/populate_club_season_stats.sql`.
    * This will take approximately a day, as Sports Monks limits their accounts to 1500 requests/hour.

#### Setup Neural Network Data
1. Run `scripts/NeuralNetworkTraining.py`. This is necessary to run the match predictions.

#### Start the Backend Server
1. Install dependencies: `npm install`
1. Create a file in the `internal/` folder named `database-info.js`.
    * This should contain the same methods as the above `databaseinfo.py` file, but in Express.js syntax.
1. Start the server: `npm run server`

#### Start the Frontend Web Application
1. Install dependencies: `cd client && npm install`
1. Start the web application: `npm run start`
1. If you want to run both the backend and front end concurrently, return to the package root and run `npm start`

## Deprecated Scripts
I previously attempted to retrieve information from two other websites before I moved to the Sports Monks API. The ETL scripts and relational schema files can be seen in the `deprecated/` folder, which has been kept for historical longevity, even though the scripts and .sql files are unused.

#### [FBRef.com](https://fbref.com) (`deprecated/fbref`)
The Sports-Reference website is in the process of creating a website for soccer statistics. However, at the time of writing, their website is only partially developed and is not guaranteed to be accurate. Unfortunately, I learned that their data was inaccurate after having already created and fully run the script used to scrape data from their website.

I used a library called BeautifulSoup in order to parse through the raw HTML of their web pages and retrieve relevant information.

#### [Football Lineups](https://www.football-lineups.com) (`deprecated/football-lineups`)
After realizing the issue with FBRef, I found another website that had even more data. Football-Lineups contains historical information about matches, including individual stats, lineups, and time of events. This sounded incredibly useful, so I reached out to the website. After a few weeks without a response, I began to follow the same pattern as I did with FBRef and started scraping the raw data from the website. However, after a few days of testing and writing the web scraping script, the website blocked my IP address. I have still not received a response from the owner of the website, so I can only guess that they saw the increased traffic and blocked the source of the requests.

I could have gotten around the IP block by using a proxy server that rotates through IP addresses for each request. However, sidestepping their action seems malicious. If they don't want me to have their data, I shouldn't steal it from them.

I used the same BeautifulSoup library as in the FBRef script, as well as running a headless Chrome window with a library called Selenium.


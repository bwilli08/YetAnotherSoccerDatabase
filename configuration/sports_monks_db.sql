#DROP DATABASE IF EXISTS SportsMonksDB;

#CREATE DATABASE SportsMonksDB
#  DEFAULT CHARACTER SET utf8
#  DEFAULT COLLATE utf8_general_ci;

USE SportsMonksDB;

# Country API - Include leagues
CREATE TABLE Country (
  id        INTEGER PRIMARY KEY,
  name      VARCHAR(64),
  continent VARCHAR(16)
);

# Venue API - Populate on demand as we go through Clubs
CREATE TABLE Venue (
  id   INTEGER PRIMARY KEY,
  name VARCHAR(64),
  city VARCHAR(64)
);

# Inferred?
CREATE TABLE Position (
  id   INTEGER PRIMARY KEY,
  name VARCHAR(32)
);

# Leagues API - include country and seasons
CREATE TABLE Competition (
  id                INTEGER PRIMARY KEY,
  is_cup            BOOLEAN,
  country_id        INTEGER,
  name              VARCHAR(64),
  finished_backfill BOOLEAN,

  FOREIGN KEY (country_id) REFERENCES Country (id)
);

# Season API - include league
CREATE TABLE Season (
  id        INTEGER PRIMARY KEY,
  year      VARCHAR(12),
  league_id INTEGER,

  FOREIGN KEY (league_id) REFERENCES Competition (id)
);

# Teams API - include venue and country
CREATE TABLE Club (
  id               INTEGER PRIMARY KEY,
  name             VARCHAR(64),
  country_id       INTEGER,
  is_national_team BOOLEAN,
  venue_id         INTEGER,

  FOREIGN KEY (country_id) REFERENCES Country (id),
  FOREIGN KEY (venue_id) REFERENCES Venue (id)
);

# Fixture API - populate on-demand
CREATE TABLE ClubSeason (
  season_id INTEGER,
  club_id   INTEGER,

  PRIMARY KEY (season_id, club_id),
  FOREIGN KEY (season_id) REFERENCES Season (id),
  FOREIGN KEY (club_id) REFERENCES Club (id)
);

# Player API - include position
# Have to retrieve by player id, so populate this on-demand (as we go through fixtures?)
CREATE TABLE Player (
  id          INTEGER PRIMARY KEY,
  nationality VARCHAR(64),
  position_id INTEGER,
  name        VARCHAR(64),
  birthdate   DATE,
  height      INTEGER,
  weight      INTEGER,

  FOREIGN KEY (position_id) REFERENCES Position (id)
);

# Fixture API - Pass in the specific competition that I care about
CREATE TABLE Fixture (
  id              INTEGER PRIMARY KEY,
  season_id       INTEGER,
  venue_id        INTEGER,
  home_team_id    INTEGER,
  away_team_id    INTEGER,
  date_of_game    DATETIME,

  # A bunch of stats
  home_team_score INTEGER,
  away_team_score INTEGER,

  FOREIGN KEY (season_id) REFERENCES Season (id),
  FOREIGN KEY (venue_id) REFERENCES Venue (id),
  FOREIGN KEY (season_id, home_team_id) REFERENCES ClubSeason (season_id, club_id),
  FOREIGN KEY (season_id, away_team_id) REFERENCES ClubSeason (season_id, club_id)
);

# Fixture API - Include lineups and substitutions
CREATE TABLE PlayerGame (
  player_id        INTEGER,
  fixture_id       INTEGER,
  club_id          INTEGER,
  position         VARCHAR(8),

  started          BOOLEAN,
  minutes_played   INTEGER,

  goals_scored     INTEGER,
  goals_conceded   INTEGER,
  assists          INTEGER,

  shots_on_goal    INTEGER,
  shots_total      INTEGER,

  fouls_committed  INTEGER,
  fouls_drawn      INTEGER,

  interceptions    INTEGER,
  saves            INTEGER,
  clearances       INTEGER,
  tackles          INTEGER,
  offsides         INTEGER,
  blocks           INTEGER,

  pen_saved        INTEGER,
  pen_missed       INTEGER,
  pen_scored       INTEGER,

  passes_total     INTEGER,
  passes_accuracy  INTEGER,
  crosses_total    INTEGER,
  crosses_accuracy INTEGER,

  PRIMARY KEY (player_id, fixture_id),
  FOREIGN KEY (player_id) REFERENCES Player (id),
  FOREIGN KEY (fixture_id) REFERENCES Fixture (id),
  FOREIGN KEY (club_id) REFERENCES Club (id)
);
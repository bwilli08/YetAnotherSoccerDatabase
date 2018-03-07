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
  id       INTEGER PRIMARY KEY,
  name     VARCHAR(64),
  city     VARCHAR(64),
  capacity INTEGER
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

  FOREIGN KEY (country_id) REFERENCES Country (id)
);

# Season API - include league
CREATE TABLE Season (
  id                INTEGER PRIMARY KEY,
  year              VARCHAR(12),
  league_id         INTEGER,
  finished_backfill BOOLEAN,

  FOREIGN KEY (league_id) REFERENCES Competition (id)
);

# Populate as we go through ClubSeason
CREATE TABLE Club (
  id               INTEGER PRIMARY KEY,
  name             VARCHAR(64),
  country_id       INTEGER,
  is_national_team BOOLEAN,
  venue_id         INTEGER,

  FOREIGN KEY (country_id) REFERENCES Country (id),
  FOREIGN KEY (venue_id) REFERENCES Venue (id)
);

# Club by Season API
CREATE TABLE ClubSeason (
  season_id INTEGER,
  club_id   INTEGER,
  finished_lineup_backfill BOOLEAN,
  finished_fixture_backfill BOOLEAN,

  PRIMARY KEY (season_id, club_id),
  FOREIGN KEY (season_id) REFERENCES Season (id),
  FOREIGN KEY (club_id) REFERENCES Club (id)
);

# Populate this table afterwards
CREATE TABLE ClubSeasonStats (
  season_id             INTEGER,
  club_id               INTEGER,

  win_total             INTEGER,
  win_home              INTEGER,
  win_away              INTEGER,

  draw_total            INTEGER,
  draw_home             INTEGER,
  draw_away             INTEGER,

  lost_total            INTEGER,
  lost_home             INTEGER,
  lost_away             INTEGER,

  goals_for_total       INTEGER,
  goals_for_home        INTEGER,
  goals_for_away        INTEGER,

  goals_against_total   INTEGER,
  goals_against_home    INTEGER,
  goals_against_away    INTEGER,

  clean_sheet_total     INTEGER,
  clean_sheet_home      INTEGER,
  clean_sheet_away      INTEGER,

  failed_to_score_total INTEGER,
  failed_to_score_home  INTEGER,
  failed_to_score_away  INTEGER,

  PRIMARY KEY (season_id, club_id),
  FOREIGN KEY (season_id, club_id) REFERENCES ClubSeason (season_id, club_id)
);

# Player API - include position
# Have to retrieve by player id, so populate this on-demand (as we go through fixtures?)
CREATE TABLE Player (
  id          INTEGER PRIMARY KEY,
  nationality VARCHAR(64),
  position_id INTEGER,
  name        VARCHAR(64),
  nickname    VARCHAR(64),
  birthdate   DATE,
  height      INTEGER,
  weight      INTEGER,

  FOREIGN KEY (position_id) REFERENCES Position (id)
);

CREATE TABLE PlayerSeason (
  player_id      INTEGER,
  season_id      INTEGER,
  club_id        INTEGER,
  position_id    INTEGER,
  roster_number  INTEGER,

  minutes_played INTEGER,
  appearances    INTEGER,
  sub_apps       INTEGER,

  goals          INTEGER,
  assists        INTEGER,
  yellow_cards   INTEGER,
  yellow_red     INTEGER,
  red_cards      INTEGER,

  PRIMARY KEY (player_id, season_id, club_id),
  FOREIGN KEY (player_id) REFERENCES Player (id),
  FOREIGN KEY (season_id, club_id) REFERENCES ClubSeason (season_id, club_id),
  FOREIGN KEY (position_id) REFERENCES Position (id)
);

# Fixture API - For each team from 1990-01-01 to now.
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
  season_id        INTEGER,
  club_id          INTEGER,
  position         VARCHAR(2),

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

  yellow_cards     INTEGER,
  red_cards        INTEGER,

  pen_saved        INTEGER,
  pen_missed       INTEGER,
  pen_scored       INTEGER,

  passes_total     INTEGER,
  passes_accuracy  INTEGER,
  crosses_total    INTEGER,
  crosses_accuracy INTEGER,

  PRIMARY KEY (player_id, fixture_id),
  FOREIGN KEY (player_id, season_id, club_id) REFERENCES PlayerSeason (player_id, season_id, club_id),
  FOREIGN KEY (fixture_id) REFERENCES Fixture (id)
);
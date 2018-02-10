#DROP DATABASE SeniorProject;

#CREATE DATABASE SeniorProject
#  DEFAULT CHARACTER SET utf8
#  DEFAULT COLLATE utf8_general_ci;

USE SeniorProject;


CREATE TABLE Player (
  player_id     INTEGER NOT NULL,
  name          VARCHAR(64),
  date_of_birth DATE,
  position      VARCHAR(10),
  height        INTEGER,
  fbref_id      VARCHAR(64),

  PRIMARY KEY (player_id),

  INDEX (name),
  INDEX (fbref_id)
);

CREATE TABLE TempPlayer (
  fbref_id          VARCHAR(64),
  finished_backfill BOOLEAN,

  PRIMARY KEY (fbref_id)
);

CREATE TABLE Club (
  # "/en/squads/{club_id}/{season}"
  club_id       VARCHAR(10),
  club_name     VARCHAR(64),

  PRIMARY KEY (club_id),
  INDEX (club_name)
);

CREATE TABLE GarbageSeason (
  club_id   VARCHAR(10),
  season    VARCHAR(10),

  PRIMARY KEY (club_id, season),
  FOREIGN KEY (club_id) REFERENCES Club (club_id)
);

CREATE TABLE ClubSeason (
  season_id         INTEGER AUTO_INCREMENT PRIMARY KEY,
  club_id           VARCHAR(10),
  season            VARCHAR(10),
  comp              VARCHAR(64),
  finished_backfill BOOLEAN,

  FOREIGN KEY (club_id) REFERENCES Club (club_id)
);

CREATE TABLE OutfieldPlayerStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season_id        INTEGER,

  # Descriptive Information
  comp             VARCHAR(64),
  age              INTEGER,

  # Game Statistics
  games            INTEGER,
  games_starts     INTEGER,
  games_subs       INTEGER,
  minutes_per_game INTEGER,

  # Outfield Statistics
  goals            INTEGER,
  assists          INTEGER,
  fouls            INTEGER,
  cards_yellow     INTEGER,
  cards_red        INTEGER,
  shots_on_target  INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY OutfieldPlayerStat (player_id) REFERENCES Player (player_id),
  FOREIGN KEY OutfieldPlayerStat (season_id) REFERENCES ClubSeason (season_id),

  INDEX (player_id)
);

CREATE TABLE GoalkeeperStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season_id        INTEGER,

  # Descriptive Information
  comp             VARCHAR(64),
  age              INTEGER,

  # Game Statistics
  games            INTEGER,
  games_starts     INTEGER,
  games_subs       INTEGER,
  minutes_per_game INTEGER,

  # Goalkeeper Stats
  save_perc        DECIMAL(5, 4),
  clean_sheets     INTEGER,
  cards_yellow     INTEGER,
  cards_red        INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY GoalkeeperStat (player_id) REFERENCES Player (player_id),
  FOREIGN KEY GoalkeeperStat (season_id) REFERENCES ClubSeason (season_id),

  INDEX (player_id)
);

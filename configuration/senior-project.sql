#DROP DATABASE SeniorProject;

#CREATE DATABASE SeniorProject
#  DEFAULT CHARACTER SET utf8
#  DEFAULT COLLATE utf8_general_ci;

USE SeniorProject;


CREATE TABLE Player (
  player_id         INTEGER NOT NULL,
  name              VARCHAR(64),
  date_of_birth     DATE,
  position          VARCHAR(10),
  height            INTEGER,
  fbref_id          VARCHAR(64),

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
  squad VARCHAR(64),

  PRIMARY KEY (squad)
);

CREATE TABLE GarbageSeason (
  fbref_id  VARCHAR(64),

  PRIMARY KEY (fbref_id)
);

CREATE TABLE ClubSeason (
  season            VARCHAR(10),
  squad             VARCHAR(64),
  fbref_id          VARCHAR(64),
  finished_backfill BOOLEAN,

  PRIMARY KEY (season, squad, fbref_id),
  FOREIGN KEY (squad) REFERENCES Club(squad)
);

CREATE TABLE OutfieldPlayerStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season           VARCHAR(10),
  squad            VARCHAR(64),
  season_fbref     VARCHAR(64),

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
  FOREIGN KEY OutfieldPlayerStat (season, squad, season_fbref) REFERENCES ClubSeason (season, squad, fbref_id),

  INDEX (player_id),
  INDEX (squad),
  INDEX (season, squad)
);

CREATE TABLE GoalkeeperStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season           VARCHAR(10),
  squad            VARCHAR(64),
  season_fbref     VARCHAR(64),

  # Descriptive Information
  comp             VARCHAR(64),
  age              INTEGER,

  # Game Statistics
  games            INTEGER,
  games_starts     INTEGER,
  games_subs       INTEGER,
  minutes_per_game INTEGER,

  # Goalkeeper Stats
  save_perc        DECIMAL(5,4),
  clean_sheets     INTEGER,
  cards_yellow     INTEGER,
  cards_red        INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY GoalkeeperStat (player_id) REFERENCES Player (player_id),
  FOREIGN KEY GoalkeeperStat (season, squad, season_fbref) REFERENCES ClubSeason (season, squad, fbref_id),

  INDEX (player_id),
  INDEX (squad),
  INDEX (season, squad)
);

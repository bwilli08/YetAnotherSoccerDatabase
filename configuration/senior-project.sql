DROP DATABASE SeniorProject;

CREATE DATABASE SeniorProject
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;
USE SeniorProject;


CREATE TABLE Player (
  player_id     INTEGER NOT NULL,
  name          VARCHAR(64),
  date_of_birth DATE,
  position      VARCHAR(10),
  height        INTEGER,

  PRIMARY KEY (player_id),

  INDEX (name)
);

CREATE TABLE Club (
  squad VARCHAR(64) PRIMARY KEY
);

CREATE TABLE ClubSeason (
  season  VARCHAR(10),
  squad   INTEGER,

  PRIMARY KEY (season, squad)
);

CREATE TABLE OutfieldPlayerStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season           VARCHAR(10),
  squad            INTEGER,

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
  FOREIGN KEY PlayerStat (player_id) REFERENCES Player (player_id),
  FOREIGN KEY PlayerStat (season, squad) REFERENCES ClubSeason (season, squad),

  INDEX (player_id),
  INDEX (squad),
  INDEX (season, squad)
);

CREATE TABLE GoalkeeperStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season           VARCHAR(10),
  squad            INTEGER,

  # Descriptive Information
  comp             VARCHAR(64),
  age              INTEGER,

  # Game Statistics
  games            INTEGER,
  games_starts     INTEGER,
  games_subs       INTEGER,
  minutes_per_game INTEGER,

  # Goalkeeper Stats
  save_perc        DECIMAL,
  clean_sheets     INTEGER,
  cards_yellow     INTEGER,
  cards_red        INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY PlayerStat (player_id) REFERENCES Player (player_id),
  FOREIGN KEY PlayerStat (season, squad) REFERENCES ClubSeason (season, squad),

  INDEX (player_id),
  INDEX (squad),
  INDEX (season, squad)
);

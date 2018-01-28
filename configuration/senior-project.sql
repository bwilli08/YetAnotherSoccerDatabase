DROP DATABASE SeniorProject;

CREATE DATABASE SeniorProject
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;
USE SeniorProject;


CREATE TABLE Player (
  player_id     INTEGER NOT NULL  AUTO_INCREMENT,
  name          VARCHAR(64),
  date_of_birth DATE,
  position      VARCHAR(10),
  height        INTEGER,

  PRIMARY KEY (player_id),

  INDEX (name)
);

CREATE TABLE Club (
  id    INTEGER NOT NULL  AUTO_INCREMENT,
  squad VARCHAR(64),

  PRIMARY KEY (id),

  INDEX (squad)
);

CREATE TABLE ClubSeason (
  id      INTEGER NOT NULL  AUTO_INCREMENT,
  season  VARCHAR(10),
  club_id INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY ClubSeason (club_id) REFERENCES Club (id),

  INDEX (season, club_id)
);

CREATE TABLE OutfieldPlayerStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season           VARCHAR(10),
  club_id          INTEGER,

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
  FOREIGN KEY PlayerStat (season, club_id) REFERENCES ClubSeason (season, club_id),

  INDEX (player_id),
  INDEX (club_id),
  INDEX (season, club_id)
);

CREATE TABLE GoalkeeperStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season           VARCHAR(10),
  club_id          INTEGER,

  # Descriptive Information
  comp             VARCHAR(64),
  age              INTEGER,

  # Game Statistics
  games            INTEGER,
  games_starts     INTEGER,
  games_subs       INTEGER,
  minutes_per_game INTEGER,

  # Goalkeeper Stats
  save_percent     DECIMAL,
  clean_sheets     INTEGER,
  cards_yellow     INTEGER,
  cards_red        INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY PlayerStat (player_id) REFERENCES Player (player_id),
  FOREIGN KEY PlayerStat (season, club_id) REFERENCES ClubSeason (season, club_id),

  INDEX (player_id),
  INDEX (club_id),
  INDEX (season, club_id)
);

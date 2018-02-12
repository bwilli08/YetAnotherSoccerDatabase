#USE FrontendDatabase;

#DROP TABLE IF EXISTS OutfieldPlayerStat;
#DROP TABLE IF EXISTS GoalkeeperStat;
#DROP TABLE IF EXISTS ClubSeason;
#DROP TABLE IF EXISTS Club;
#DROP TABLE IF EXISTS Player;
#DROP DATABASE IF EXISTS FrontendDatabase;

#CREATE DATABASE FrontendDatabase
#  DEFAULT CHARACTER SET utf8
#  DEFAULT COLLATE utf8_general_ci;

USE FrontendDatabase;


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
  # "/en/squads/{club_id}/{season}"
  club_id       VARCHAR(10),
  club_name     VARCHAR(64),

  PRIMARY KEY (club_id),
  INDEX (club_name)
);

CREATE TABLE ClubSeason (
  season_id         INTEGER AUTO_INCREMENT PRIMARY KEY,
  club_id           VARCHAR(10),
  season            VARCHAR(10),
  comp              VARCHAR(64),

  FOREIGN KEY (club_id) REFERENCES Club (club_id),
  UNIQUE (club_id, season, comp)
);

CREATE TABLE GoalkeeperStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season_id        INTEGER,

  # Descriptive Information
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
  UNIQUE (player_id, season_id),
  FOREIGN KEY GoalkeeperStat_Player (player_id) REFERENCES Player (player_id),
  FOREIGN KEY GoalkeeperStat_Season (season_id) REFERENCES ClubSeason (season_id),
  INDEX (player_id),
  INDEX (season_id)
);

CREATE TABLE OutfieldPlayerStat (
  id               INTEGER NOT NULL  AUTO_INCREMENT,
  player_id        INTEGER,
  season_id        INTEGER,

  # Descriptive Information
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
  FOREIGN KEY OutfieldPlayerStat_Player (player_id) REFERENCES Player (player_id),
  FOREIGN KEY OutfieldPlayerStat_Season (season_id) REFERENCES ClubSeason (season_id),
  INDEX (player_id),
  INDEX (season_id)
);

#INSERT INTO frontenddatabase.player SELECT * FROM seniorproject.player;

#INSERT INTO frontenddatabase.club SELECT * FROM seniorproject.club;
#INSERT INTO frontenddatabase.clubseason SELECT * FROM seniorproject.clubseason;
#INSERT INTO frontenddatabase.goalkeeperstat SELECT * FROM seniorproject.goalkeeperstat;
#INSERT INTO frontenddatabase.outfieldplayerstat SELECT * FROM seniorproject.outfieldplayerstat;

#ALTER TABLE Player ADD INDEX (player_id);
#ALTER TABLE Player ADD INDEX (fbref_id);
#ALTER TABLE OutfieldPlayerStat ADD INDEX (player_id);
#ALTER TABLE OutfieldPlayerStat ADD INDEX (squad);
#ALTER TABLE OutfieldPlayerStat ADD INDEX (season, squad);
#ALTER TABLE GoalkeeperStat ADD INDEX (player_id);
#ALTER TABLE GoalkeeperStat ADD INDEX (squad);
#ALTER TABLE GoalkeeperStat ADD INDEX (season, squad);

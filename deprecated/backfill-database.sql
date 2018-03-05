#USE FBREFBackfill;

#DROP TABLE IF EXISTS OutfieldPlayerStat;
#DROP TABLE IF EXISTS GoalkeeperStat;
#DROP TABLE IF EXISTS ClubSeason;
#DROP TABLE IF EXISTS GarbageSeason;
#DROP TABLE IF EXISTS Club;
#DROP TABLE IF EXISTS TempPlayer;
#DROP TABLE IF EXISTS Player;
#DROP DATABASE IF EXISTS FBREFBackfill;

#CREATE DATABASE FBREFBackfill
#  DEFAULT CHARACTER SET utf8
#  DEFAULT COLLATE utf8_general_ci;

USE FBREFBackfill;


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
  squad VARCHAR(64),

  PRIMARY KEY (squad)
);

CREATE TABLE GarbageSeason (
  fbref_id VARCHAR(64),

  PRIMARY KEY (fbref_id)
);

CREATE TABLE ClubSeason (
  season            VARCHAR(10),
  squad             VARCHAR(64),
  fbref_id          VARCHAR(64),
  finished_backfill BOOLEAN,

  PRIMARY KEY (season, squad, fbref_id),
  FOREIGN KEY (squad) REFERENCES Club (squad)
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
  save_perc        DECIMAL(5, 4),
  clean_sheets     INTEGER,
  cards_yellow     INTEGER,
  cards_red        INTEGER,

  PRIMARY KEY (id),
  FOREIGN KEY GoalkeeperStat_Player (player_id) REFERENCES Player (player_id),
  FOREIGN KEY GoalkeeperStat_Season (season, squad, season_fbref) REFERENCES ClubSeason (season, squad, fbref_id),

  INDEX (player_id),
  INDEX (squad),
  INDEX (season, squad)
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
  FOREIGN KEY OutfieldPlayerStat_Player (player_id) REFERENCES Player (player_id),
  FOREIGN KEY OutfieldPlayerStat_Season (season, squad, season_fbref) REFERENCES ClubSeason (season, squad, fbref_id),

  INDEX (player_id),
  INDEX (squad),
  INDEX (season, squad)
);

#INSERT INTO fbrefbackfill.club SELECT * FROM seniorproject.club;
#INSERT INTO fbrefbackfill.player SELECT * FROM seniorproject.player;
#INSERT INTO fbrefbackfill.garbageseason SELECT * FROM seniorproject.garbageseason;
#INSERT INTO fbrefbackfill.clubseason SELECT * FROM seniorproject.clubseason;
#INSERT INTO fbrefbackfill.tempplayer SELECT * FROM seniorproject.tempplayer;
#INSERT INTO fbrefbackfill.goalkeeperstat SELECT * FROM seniorproject.goalkeeperstat;
#INSERT INTO fbrefbackfill.outfieldplayerstat SELECT * FROM seniorproject.outfieldplayerstat;

#ALTER TABLE Player ADD INDEX (player_id);
#ALTER TABLE Player ADD INDEX (fbref_id);
#ALTER TABLE OutfieldPlayerStat ADD INDEX (player_id);
#ALTER TABLE OutfieldPlayerStat ADD INDEX (squad);
#ALTER TABLE OutfieldPlayerStat ADD INDEX (season, squad);
#ALTER TABLE GoalkeeperStat ADD INDEX (player_id);
#ALTER TABLE GoalkeeperStat ADD INDEX (squad);
#ALTER TABLE GoalkeeperStat ADD INDEX (season, squad);
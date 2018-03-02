#DROP DATABASE IF EXISTS LineupsDatabase;

#CREATE DATABASE LineupsDatabase
#  DEFAULT CHARACTER SET utf8
#  DEFAULT COLLATE utf8_general_ci;

USE LineupsDatabase;

CREATE TABLE Positions (
  # Positions are granular, i.e. LW, RW, ST, etc.
  position VARCHAR(8) PRIMARY KEY,
  # Roles are broad, i.e. DF (defense), MF (midfield), etc.
  role     VARCHAR(8)
);

CREATE TABLE Club (
  club_id   INTEGER PRIMARY KEY AUTO_INCREMENT,
  fl_ref    VARCHAR(128),
  club_name VARCHAR(64),
  stadium   VARCHAR(64),
  country   VARCHAR(64),

  UNIQUE KEY (fl_ref)
);

CREATE TABLE Competition (
  comp_id   INTEGER PRIMARY KEY AUTO_INCREMENT,
  fl_ref    VARCHAR(128),
  comp_name VARCHAR(64),
  country   VARCHAR(64),
  year      VARCHAR(64),

  UNIQUE KEY (fl_ref)
);

CREATE TABLE Player (
  player_id   INTEGER PRIMARY KEY AUTO_INCREMENT,
  fl_ref      VARCHAR(128),
  name        VARCHAR(64),
  nationality VARCHAR(64),
  dob         DATE,
  height      DECIMAL(3, 2),
  foot        VARCHAR(8),
  position    VARCHAR(8),

  UNIQUE KEY (fl_ref)

  #FOREIGN KEY (position) REFERENCES Positions(position)
);

CREATE TABLE ClubSeason (
  club_id       INTEGER,
  comp_id       INTEGER,
  fl_ref        VARCHAR(128),

  final_place   INTEGER,
  points        INTEGER,
  games         INTEGER,
  wins          INTEGER,
  draws         INTEGER,
  losses        INTEGER,
  goals_scored  INTEGER,
  goals_against INTEGER,

  PRIMARY KEY (club_id, comp_id),

  FOREIGN KEY (club_id) REFERENCES Club (club_id),
  FOREIGN KEY (comp_id) REFERENCES Competition (comp_id),

  UNIQUE KEY (fl_ref)
);

CREATE TABLE Game (
  game_id            INTEGER PRIMARY KEY AUTO_INCREMENT,
  comp_id            INTEGER,
  # Group Stage, Playoffs, League, etc.
  stage              VARCHAR(64),
  fl_ref             VARCHAR(128),

  home_club_id       INTEGER,
  home_goals         INTEGER,
  home_shots         INTEGER,
  home_shots_on_goal INTEGER,
  home_fouls         INTEGER,
  home_corners       INTEGER,
  home_offsides      INTEGER,
  home_possession    DECIMAL(4, 2),
  home_yellow_cards  INTEGER,
  home_red_cards     INTEGER,

  away_club_id       INTEGER,
  away_goals         INTEGER,
  away_shots         INTEGER,
  away_shots_on_goal INTEGER,
  away_fouls         INTEGER,
  away_corners       INTEGER,
  away_offsides      INTEGER,
  away_possession    DECIMAL(4, 2),
  away_yellow_cards  INTEGER,
  away_red_cards     INTEGER,

  FOREIGN KEY (comp_id, home_club_id) REFERENCES ClubSeason (comp_id, club_id),
  FOREIGN KEY (comp_id, away_club_id) REFERENCES ClubSeason (comp_id, club_id),

  UNIQUE KEY (fl_ref)
);

CREATE TABLE PlayerSeason (
  player_season_id   INTEGER PRIMARY KEY AUTO_INCREMENT,
  player_id          INTEGER,
  comp_id            INTEGER,
  club_id            INTEGER,

  most_used_position VARCHAR(8),
  games_played       INTEGER,
  minutes_played     INTEGER,
  yellow_cards       INTEGER,
  red_cards          INTEGER,
  goals              INTEGER,
  assists            INTEGER,
  goals_conceded     INTEGER,
  saves              INTEGER,

  FOREIGN KEY (player_id) REFERENCES Player (player_id),
  FOREIGN KEY (comp_id, club_id) REFERENCES ClubSeason (comp_id, club_id)
  #FOREIGN KEY (most_used_position) REFERENCES Positions(position)
);

CREATE TABLE PlayerGame (
  player_match_id  INTEGER PRIMARY KEY AUTO_INCREMENT,
  game_id          INTEGER,
  player_season_id INTEGER,
  position         VARCHAR(8),
  started          BOOLEAN,
  minutes_played   INTEGER,
  yellow_card      BOOLEAN,
  red_card         BOOLEAN,
  goals            INTEGER,
  assists          INTEGER,
  goals_conceded   INTEGER,
  saves            INTEGER,

  FOREIGN KEY (game_id) REFERENCES Game (game_id),
  FOREIGN KEY (player_season_id) REFERENCES PlayerSeason (player_season_id)
  #FOREIGN KEY (position) REFERENCES Positions(position)
);
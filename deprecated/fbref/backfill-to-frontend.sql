# Players
INSERT IGNORE INTO frontenddatabase.Player
  (SELECT
     player_id,
     name,
     date_of_birth,
     position,
     height
   FROM fbrefbackfill.Player);

# Clubs
INSERT IGNORE INTO frontenddatabase.club
  (SELECT DISTINCT
     SUBSTRING_INDEX(SUBSTRING_INDEX(fbref_id, '/', 4), '/', -1) AS club_id,
     squad
   FROM fbrefbackfill.ClubSeason cs);

# Club Seasons
INSERT IGNORE INTO frontenddatabase.clubseason (club_id, season, comp)
  (SELECT DISTINCT
     SUBSTRING_INDEX(SUBSTRING_INDEX(season_fbref, '/', 4), '/', -1) AS club_id,
     season,
     comp
   FROM fbrefbackfill.OutfieldPlayerStat);
INSERT IGNORE INTO frontenddatabase.clubseason (club_id, season, comp)
  (SELECT DISTINCT
     SUBSTRING_INDEX(SUBSTRING_INDEX(season_fbref, '/', 4), '/', -1) AS club_id,
     season,
     comp
   FROM fbrefbackfill.GoalkeeperStat);

# Goalkeepers
INSERT IGNORE INTO frontenddatabase.goalkeeperstat (player_id, season_id, age, games, games_starts, games_subs, minutes_per_game, save_perc, clean_sheets, cards_yellow, cards_red)
  (SELECT
     player_id,
     season_id,
     age,
     games,
     games_starts,
     games_subs,
     minutes_per_game,
     save_perc,
     clean_sheets,
     cards_yellow,
     cards_red
   FROM fbrefbackfill.goalkeeperstat gs
     LEFT JOIN frontenddatabase.clubseason cs
       ON cs.club_id = SUBSTRING_INDEX(SUBSTRING_INDEX(gs.season_fbref, '/', 4), '/', -1)
          AND cs.season = SUBSTRING_INDEX(SUBSTRING_INDEX(gs.season_fbref, '/', 5), '/', -1));

# Outfield Players
INSERT IGNORE INTO frontenddatabase.outfieldplayerstat (player_id, season_id, age, games, games_starts, games_subs, minutes_per_game, goals, assists, fouls, cards_yellow, cards_red, shots_on_target)
  (SELECT
     player_id,
     season_id,
     age,
     games,
     games_starts,
     games_subs,
     minutes_per_game,
     goals,
     assists,
     fouls,
     cards_yellow,
     cards_red,
     shots_on_target
   FROM fbrefbackfill.outfieldplayerstat ps
     LEFT JOIN frontenddatabase.clubseason cs
       ON cs.club_id = SUBSTRING_INDEX(SUBSTRING_INDEX(ps.season_fbref, '/', 4), '/', -1)
          AND cs.season = SUBSTRING_INDEX(SUBSTRING_INDEX(ps.season_fbref, '/', 5), '/', -1));
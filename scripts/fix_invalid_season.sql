UPDATE PlayerSeason ps
 JOIN (SELECT pg.player_id, pg.season_id, pg.club_id,
         COALESCE(SUM(pg.minutes_played), 0) as minutes_played,
         COUNT(*) as appearances,
         0 as sub_apps,
         SUM(pg.goals_scored) as goals,
         SUM(pg.assists) as assists,
         SUM(pg.yellow_cards = 1) as yellow_cards,
         SUM(pg.yellow_cards = 2) as yellow_red,
         SUM(pg.yellow_cards != 2 AND pg.red_cards > 0) as red_cards
       FROM PlayerGame pg
       GROUP BY pg.player_id, pg.season_id, pg.club_id) as pgs
  USING (player_id, season_id, club_id)
    SET
      ps.minutes_played = pgs.minutes_played,
      ps.appearances = pgs.appearances,
      ps.sub_apps = pgs.sub_apps,
      ps.goals = pgs.goals,
      ps.assists = pgs.assists,
      ps.yellow_cards = pgs.yellow_cards,
      ps.yellow_red = pgs.yellow_red,
      ps.red_cards = pgs.red_cards
WHERE ps.minutes_played = -1;

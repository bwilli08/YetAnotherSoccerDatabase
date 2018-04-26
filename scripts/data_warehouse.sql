USE SportsMonksDB;

INSERT INTO PlayerStatsByYear
  (
    SELECT
      agg.*,
      p.nationality,
      pos.name,
      p.nickname
    FROM
      Player p,
      Position pos,
      (
        SELECT
          pg.player_id,
          REPLACE(s.year, '/', '') as year,
          COUNT(*)                AS games,
          SUM(pg.goals_scored)    AS goals,
          SUM(pg.assists)         AS assists,
          SUM(pg.shots_on_goal)   AS shots_on_goal,
          SUM(pg.shots_total)     AS shots,
          SUM(pg.fouls_committed) AS fouls_committed,
          SUM(pg.fouls_drawn)     AS fouls_drawn,
          SUM(pg.interceptions)   AS interceptions,
          SUM(pg.saves)           AS saves,
          SUM(pg.clearances)      AS clearances,
          SUM(pg.tackles)         AS tackles,
          SUM(pg.offsides)        AS offsides,
          SUM(pg.blocks)          AS blocks,
          SUM(pg.yellow_cards)    AS yellow_cards,
          SUM(pg.red_cards)       AS red_cards,
          SUM(pg.passes_total)    AS passes,
          SUM(pg.crosses_total)   AS crosses
        FROM
          Season s,
          PlayerGame pg
        WHERE pg.season_id = s.id
        GROUP BY pg.player_id, s.year
      ) agg
    WHERE p.id = agg.player_id
          AND p.position_id = pos.id
  );

INSERT IGNORE INTO PlayerStatsByYear
  (
    SELECT
      agg.*,
      p.nationality,
      pos.name,
      p.nickname
    FROM
      Player p,
      Position pos,
      (
        SELECT
          ps.player_id,
          REPLACE(s.year, '/', '') as year,
          SUM(appearances) + SUM(sub_apps)             AS games,
          SUM(ps.goals)        AS goals,
          SUM(ps.assists)      AS assists,
          0                    AS shots_on_goal,
          0                    AS shots,
          0                    AS fouls_committed,
          0                    AS fouls_drawn,
          0                    AS interceptions,
          0                    AS saves,
          0                    AS clearances,
          0                    AS tackles,
          0                    AS offsides,
          0                    AS blocks,
          SUM(ps.yellow_cards) AS yellow_cards,
          SUM(ps.red_cards)    AS red_cards,
          0                    AS passes,
          0                    AS crosses
        FROM
          Season s,
          PlayerSeason ps
        WHERE ps.season_id = s.id
        GROUP BY ps.player_id, s.year
      ) agg
    WHERE p.id = agg.player_id
          AND p.position_id = pos.id
  );

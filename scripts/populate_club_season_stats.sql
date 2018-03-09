USE SportsMonksDB;

INSERT IGNORE INTO ClubSeasonStats
  (
    SELECT
      f.season_id,
      c.id,
      SUM((c.id = f.home_team_id AND f.home_team_score > f.away_team_score) OR
          (c.id = f.away_team_id AND f.away_team_score > f.home_team_score)) AS numWins,
      SUM(c.id = f.home_team_id AND f.home_team_score > f.away_team_score)   AS numWinsHome,
      SUM(c.id = f.away_team_id AND f.away_team_score > f.home_team_score)   AS numWinsAway,
      SUM((c.id = f.home_team_id AND f.home_team_score = f.away_team_score) OR
          (c.id = f.away_team_id AND f.away_team_score = f.home_team_score)) AS numDraws,
      SUM(c.id = f.home_team_id AND f.home_team_score = f.away_team_score)   AS numDrawsHome,
      SUM(c.id = f.away_team_id AND f.away_team_score = f.home_team_score)   AS numDrawsAway,
      SUM((c.id = f.home_team_id AND f.home_team_score < f.away_team_score) OR
          (c.id = f.away_team_id AND f.away_team_score < f.home_team_score)) AS numLosses,
      SUM(c.id = f.home_team_id AND f.home_team_score < f.away_team_score)   AS numLossesHome,
      SUM(c.id = f.away_team_id AND f.away_team_score < f.home_team_score)   AS numLossesAway,
      SUM(CASE
          WHEN c.id = f.home_team_id
            THEN f.home_team_score
          ELSE f.away_team_score
          END)                                                               AS numGoalsFor,
      SUM(CASE
          WHEN c.id = f.home_team_id
            THEN f.home_team_score
          ELSE 0
          END)                                                               AS numGoalsForHome,
      SUM(CASE
          WHEN c.id = f.home_team_id
            THEN 0
          ELSE f.away_team_score
          END)                                                               AS numGoalsForAway,
      SUM(CASE
          WHEN c.id = f.home_team_id
            THEN f.away_team_score
          ELSE f.home_team_score
          END)                                                               AS numGoalsAgainst,
      SUM(CASE
          WHEN c.id = f.home_team_id
            THEN f.away_team_score
          ELSE 0
          END)                                                               AS numGoalsAgainstHome,
      SUM(CASE
          WHEN c.id = f.home_team_id
            THEN 0
          ELSE f.home_team_score
          END)                                                               AS numGoalsAgainstAway,
      SUM((c.id = f.home_team_id AND f.away_team_score = 0) OR
          (c.id = f.away_team_id AND f.home_team_score = 0))                 AS numCleanSheets,
      SUM(c.id = f.home_team_id AND f.away_team_score = 0)                   AS numCleanSheetsHome,
      SUM(c.id = f.away_team_id AND f.home_team_score = 0)                   AS numCleanSheetsAway,
      SUM((c.id = f.home_team_id AND f.home_team_score = 0) OR
          (c.id = f.away_team_id AND f.away_team_score = 0))                 AS numFailedToScore,
      SUM(c.id = f.home_team_id AND f.home_team_score = 0)                   AS numFailedToScoreHome,
      SUM(c.id = f.away_team_id AND f.away_team_score = 0)                   AS numFailedToScoreAway
    FROM Club c, Fixture f
    WHERE finished_fixture_backfill AND (c.id = f.home_team_id OR c.id = f.away_team_id)
    GROUP BY c.id, f.season_id
  );
USE SeniorProject;

# There are situations where players can be set to true but not have an associated Player entry.
# This serves to reset the backfill attribute for those players to be picked up by the backfiller.
UPDATE TempPlayer tp
SET tp.finished_backfill=false
WHERE (tp.finished_backfill=true) AND (tp.fbref_id not in (SELECT DISTINCT fbref_id FROM Player p));
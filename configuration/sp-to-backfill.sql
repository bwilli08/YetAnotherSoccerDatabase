INSERT IGNORE INTO fbrefbackfill.player (SELECT * FROM seniorproject.player);

INSERT IGNORE INTO fbrefbackfill.tempplayer (SELECT * FROM seniorproject.tempplayer);

INSERT IGNORE INTO fbrefbackfill.club (SELECT * FROM seniorproject.club);

INSERT IGNORE INTO fbrefbackfill.garbageseason (SELECT * FROM seniorproject.garbageseason);

INSERT IGNORE INTO fbrefbackfill.clubseason (SELECT * FROM seniorproject.clubseason);

INSERT IGNORE INTO fbrefbackfill.outfieldplayerstat (SELECT * FROM seniorproject.outfieldplayerstat);

INSERT IGNORE INTO fbrefbackfill.goalkeeperstat (SELECT * FROM seniorproject.goalkeeperstat);

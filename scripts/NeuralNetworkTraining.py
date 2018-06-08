import warnings
import sys
import pandas as pd
import numpy as np

from sqlalchemy import create_engine

sys.path.insert(0, '../internal')
import databaseinfo

engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(
    databaseinfo.db_user(),
    databaseinfo.db_passwd(),
    databaseinfo.db_host(),
    databaseinfo.db_name()))

def toSqlRename(tableName, attribute, prefix):
    return "%s.%s as %s%s" % (tableName, attribute, prefix, attribute)

player_attributes = [
    "minutes_played",
    "appearances",
    "goals",
    "goals_conceded",
    "assists",
    "shots_on_goal",
    "shots_total",
    "fouls_committed",
    "fouls_drawn",
    "interceptions",
    "saves",
    "clearances",
    "tackles",
    "offsides",
    "blocks",
    "pen_saved",
    "pen_missed",
    "pen_scored",
    "passes_total",
    "crosses_total"
]

def player_rename(tableName, attribute, prefix):
    return "%s.%s as %s%s" % (tableName, attribute, prefix, attribute)

def home_player_rename(attribute):
    return player_rename("ls", attribute, "home_")

def away_player_rename(attribute):
    return player_rename("ls", attribute, "away_")

def homeRename(attribute):
    return toSqlRename("css", attribute, "home_")

def awayRename(attribute):
    return toSqlRename("css", attribute, "away_")

attributes = [
    "win_total",
    "draw_total",
    "lost_total",
    "goals_for_total",
    "goals_against_total",
    "clean_sheet_total",
    "failed_to_score_total"
]

home_string = ", ".join(list(map(homeRename, attributes)))
home_players_string = ", ".join(list(map(home_player_rename, player_attributes)))
away_string = ", ".join(list(map(awayRename, attributes)))
away_players_string = ", ".join(list(map(away_player_rename, player_attributes)))

club_attribute_query = "SELECT home.*, %s, %s \
FROM (  SELECT f.*, %s, %s \
        FROM Fixture f, ClubSeasonStats css, LineupStats ls \
        WHERE f.season_id=css.season_id \
            AND f.home_team_id=css.club_id \
            AND f.id=ls.fixture_id \
            AND f.home_team_id=ls.club_id \
     ) home, \
    ClubSeasonStats css, \
    LineupStats ls \
WHERE home.season_id=css.season_id \
    AND home.away_team_id=css.club_id  \
    AND home.id=ls.fixture_id \
    AND home.away_team_id=ls.club_id" % (away_string, away_players_string, home_string, home_players_string)

def getResult(scores):
    home_score = scores[0]
    away_score = scores[1]
    
    if home_score > away_score:
        return '0'
    elif home_score == away_score:
        return '1'
    else:
        return '2'

def getGoalsLabel(goals):
    return str(goals) if goals < 5 else '5+'
    
resoverall = engine.execute(club_attribute_query)
df = pd.DataFrame(resoverall.fetchall())
df.columns = resoverall.keys()

scores = df.loc[:, ['home_team_score', 'away_team_score']]
df['Result'] = scores.apply(getResult, axis=1)

home_scores = scores['home_team_score']
df['Home_Result'] = home_scores.apply(getGoalsLabel)

away_scores = scores['home_team_score']
df['Away_Result'] = away_scores.apply(getGoalsLabel)

df.to_sql('NeuralNetworkTraining', con=engine, index=False, if_exists='append')
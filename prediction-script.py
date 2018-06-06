#!/usr/bin/python3

import warnings
import sys
import pandas as pd
import numpy as np

from functools import reduce

from sqlalchemy import create_engine

from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

sys.path.insert(0, './internal')
import databaseinfo

engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(
    databaseinfo.db_user(),
    databaseinfo.db_passwd(),
    databaseinfo.db_host(),
    databaseinfo.db_name()))

training_data = pd.read_sql("SELECT * FROM neuralnetworktraining", engine)
X = np.array([list(x) for x in training_data.loc[:, 'home_win_total':'away_crosses_total'].values])
outcome_Y = np.array(training_data['Result'].values)

club_attributes = [
    "win_total",
    "draw_total",
    "lost_total",
    "goals_for_total",
    "goals_against_total",
    "clean_sheet_total",
    "failed_to_score_total"
]

club_attribute_string = ", ".join(club_attributes)

club_query_format = "SELECT %s \
        FROM ClubSeasonStats css \
        WHERE season_id=%s \
            AND club_id=%s"

def getSeasonStatsForClub(season_id, club_id):
    qry = club_query_format % (club_attribute_string, season_id, club_id)
    
    output = []
    result = engine.execute(qry).fetchall()
    for value in result[0]:
        output.append(value)

    return output

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

def player_rename(attribute):
    return "SUM(%s) as %s" % (attribute, attribute)

player_attribute_string = ", ".join(list(map(player_rename, player_attributes)))

lineup_query_format =  "SELECT %s \
                        FROM (SELECT pg.player_id, \
                                  pg.season_id, \
                                  pg.club_id \
                              FROM PlayerGame pg \
                              WHERE pg.season_id=%s \
                                AND pg.club_id=%s \
                                AND pg.player_id in (%s)) p, \
                              playerseason ps \
                        WHERE p.player_id=ps.player_id \
                            AND p.season_id=ps.season_id \
                            AND p.club_id=ps.club_id"

def getSeasonStatsForLineup(season_id, club_id, player_ids):
    player_id_string = ", ".join(map(str, player_ids))
    qry = lineup_query_format % (player_attribute_string, season_id, club_id, player_id_string)
    
    output = []
    result = engine.execute(qry).fetchall()
    for value in result[0]:
        output.append(int(value))

    return output

def getNeuralNetworkInput(season_id, home_club_id, home_player_ids, away_club_id, away_player_ids):
    nn_input = getSeasonStatsForClub(season_id, home_club_id)
    nn_input = nn_input + getSeasonStatsForLineup(season_id, home_club_id, home_player_ids)
    nn_input = nn_input + getSeasonStatsForClub(season_id, away_club_id)
    nn_input = nn_input + getSeasonStatsForLineup(season_id, away_club_id, away_player_ids)
    return nn_input

def getOutcomeProbabilities(X, Y, nn_input):
    predictions = []
    
    for _ in range(0, 5, 1):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")

            scaler = StandardScaler()
            scaler.fit(X)

            model = MLPClassifier(max_iter=500, hidden_layer_sizes=(11, 13))

            X_std = scaler.transform(X)
            model.fit(X_std, Y)

            nn_input_std = scaler.transform([nn_input])

            predictions.append(model.predict_proba(nn_input_std)[0])

    result = reduce((lambda x, y: (x[0] + y[0], x[1] + y[1], x[2] + y[2])), predictions)
    return list(map(lambda x: x / 5, result))

def parseListArg(arg):
    arr = arg.replace('[', '').replace(']', '').split(',')

    return [int(x) for x in arr]

season_id = int(sys.argv[1])
home_club_id = int(sys.argv[2])
home_players = parseListArg(sys.argv[3])
away_club_id = int(sys.argv[4])
away_players = parseListArg(sys.argv[5])

nn_input = getNeuralNetworkInput(season_id, home_club_id, home_players, away_club_id, away_players)

outcome_probs = getOutcomeProbabilities(X, outcome_Y, nn_input)

print(outcome_probs)
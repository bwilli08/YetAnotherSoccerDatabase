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

# See the README file for what the databaseinfo.py file should contain.
sys.path.insert(0, './internal')
import databaseinfo

engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(
    databaseinfo.db_user(),
    databaseinfo.db_passwd(),
    databaseinfo.db_host(),
    databaseinfo.db_name()))

# Extract the training data and split it into input, outcome result, and score result
training_data = pd.read_sql("SELECT * FROM neuralnetworktraining", engine)
X = np.array([list(x) for x in training_data.loc[:, 'home_win_total':'away_crosses_total'].values])
outcome_Y = np.array(training_data['Result'].values)
score_Y = training_data[['Home_Result', 'Away_Result']]

#####
# Extraction of club statistics for a given season and club.
#####
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

#####
# End Club Stat Extraction
#####

#####
# Extraction of a lineups statistics for a given season, club, and list of players
#####
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
                        FROM playerseason \
                        WHERE season_id=%s \
                            AND club_id=%s \
                            AND player_id in (%s)"

def getSeasonStatsForLineup(season_id, club_id, player_ids):
    player_id_string = ", ".join(map(str, player_ids))
    qry = lineup_query_format % (player_attribute_string, season_id, club_id, player_id_string)

    output = []
    result = engine.execute(qry).fetchall()
    for value in result[0]:
        output.append(int(value))

    return output

#####
# End Lineup Stat Extraction
#####

# Utility method to generate the correct neural network input for a given call.
# Output format: [home_club_stats] + [home_lineup_stats] + [away_club_stats] + [away_lineup_stats]
def getNeuralNetworkInput(season_id, home_club_id, home_player_ids, away_club_id, away_player_ids):
    nn_input = getSeasonStatsForClub(season_id, home_club_id)
    nn_input = nn_input + getSeasonStatsForLineup(season_id, home_club_id, home_player_ids)
    nn_input = nn_input + getSeasonStatsForClub(season_id, away_club_id)
    nn_input = nn_input + getSeasonStatsForLineup(season_id, away_club_id, away_player_ids)
    return nn_input

# Predicts the likelihood that each possible output occurs.
#
# Output: list of probabilities
def getProbabilities(X, Y, hidden_layers, nn_input):
    predictions = []

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")

        scaler = StandardScaler()
        scaler.fit(X)
        X_std = scaler.transform(X)
        nn_input_std = scaler.transform([nn_input])

        model = MLPClassifier(max_iter=500, hidden_layer_sizes=hidden_layers, random_state=1)
        model.fit(X_std, Y)
        return model.predict_proba(nn_input_std)[0]

# Predicts the score probabilities for both the home and away team,
# then determines the most likely scoreline given those probabilities.
#
# Output: [(home_score, away_score), likelihood]
def getMostProbableScore(X, Y, nn_input):
    home_probas = getProbabilities(X, np.array(Y['Home_Result'].values), (6), nn_input)
    away_probas = getProbabilities(X, np.array(Y['Away_Result'].values), (6), nn_input)

    probability = [[], [], [], [], [], []]

    for home_idx, home_score in enumerate(home_probas):
        for away_idx, away_score in enumerate(away_probas):
            probability[home_idx].append(home_score * away_score)

    matrix = np.asmatrix(probability)
    result = list(np.unravel_index(np.argmax(matrix, axis=None), matrix.shape))
    result.append(float("{:.2f}".format(np.max(matrix, axis=None) * 100)))
    return result

# Parses a comma-delimited list and returns the list of values
def parseListArg(arg):
    arr = arg.replace('[', '').replace(']', '').split(',')

    return [int(x) for x in arr]

# Input for a given prediction call:
#     argv[0] - ./prediction-script.py
#     argv[1] - season id
#     argv[2] - home club id
#     argv[3] - comma-delimited list of player ids
#     argv[4] - away club id)
#     argv[5] - comma-delimited list of player ids
season_id = int(sys.argv[1])
home_club_id = int(sys.argv[2])
home_players = parseListArg(sys.argv[3])
away_club_id = int(sys.argv[4])
away_players = parseListArg(sys.argv[5])

nn_input = getNeuralNetworkInput(season_id, home_club_id, home_players, away_club_id, away_players)

# Convert to list and round decimals
#
# Output: [home_win_probability, draw_probability, away_win_probability]
outcome_probs = getProbabilities(X, outcome_Y, (9, 8), nn_input)
print(list(map((lambda x: float("{:.2f}".format(x * 100))), outcome_probs)))

# Determines most likely scoreline.
#
# Output: [(home_goals, away_goals), probability]
likely_score = getMostProbableScore(X, score_Y, nn_input)
print(likely_score)
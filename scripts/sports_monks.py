#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

import datetime
import pandas
import requests
import sys
import time
from sqlalchemy import create_engine

sys.path.insert(0, '../internal')
import sports_monks_tok
import databaseinfo

##### Global variables
api_token = sports_monks_tok.sports_monks_token()
token_param = {'api_token': api_token}
headers = {'Accept': 'application/json'}
base_url = "https://soccer.sportmonks.com/api/v2.0"

##### Global Engine Object
engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(
    databaseinfo.db_user(),
    databaseinfo.db_passwd(),
    databaseinfo.db_host(),
    databaseinfo.db_name()))


def convert_sql_result_to_list(statement, fun):
    return list(map(fun, engine.execute(statement).fetchall()))


def convert_sql_result_to_set(statement, fun):
    return set(map(fun, engine.execute(statement).fetchall()))


# Global State of Database Tables (Only PKs)
countries = convert_sql_result_to_list("SELECT id FROM Country", (lambda x: x[0]))
venues = convert_sql_result_to_list("SELECT id FROM Venue", (lambda x: x[0]))
positions = convert_sql_result_to_list("SELECT id FROM Position", (lambda x: x[0]))
competitions = convert_sql_result_to_list("SELECT id FROM Competition", (lambda x: x[0]))
invalid_seasons = convert_sql_result_to_list("SELECT id FROM Season WHERE league_id=0", (lambda x: x[0]))
seasons = convert_sql_result_to_list("SELECT id, finished_backfill FROM Season WHERE league_id!=0",
                                     (lambda x: (x[0], x[1])))
clubs = convert_sql_result_to_list("SELECT id, finished_fixture_backfill FROM Club", (lambda x: (x[0], x[1])))
club_seasons = convert_sql_result_to_list(
    "SELECT season_id, club_id, finished_lineup_backfill FROM ClubSeason",
    (lambda x: ((x[0], x[1]), x[2])))
players = convert_sql_result_to_list("SELECT id FROM Player", (lambda x: x[0]))
player_seasons = convert_sql_result_to_list("SELECT player_id, season_id, club_id FROM PlayerSeason",
                                            (lambda x: (x[0], x[1], x[2])))
fixtures = convert_sql_result_to_list("SELECT id FROM Fixture", (lambda x: x[0]))
player_games = convert_sql_result_to_list("SELECT player_id, fixture_id FROM PlayerGame", (lambda x: (x[0], x[1])))

last_call = int(round(time.time() * 1000))

##### Helper Functions
def merge_dicts(x, y):
    if not x:
        return y
    elif not y:
        return x
    else:
        z = x.copy()  # start with x's keys and values
        z.update(y)  # modifies z with y's keys and values & returns None
        return z


def sports_monks_api(api_string, additional_params):
    global last_call

    endpoint = base_url + api_string
    params = merge_dicts(token_param, additional_params)

    while int(round(time.time() * 1000)) < last_call + 3400:
        continue
    last_call = int(round(time.time() * 1000))
    print((endpoint, params))
    return requests.get(endpoint, headers=headers, params=params).json()


def paginated_request(api_endpoint, base_params, data_func):
    additional_params = base_params
    cont = True

    while cont:
        resp = sports_monks_api(api_endpoint, additional_params)

        if 'pagination' in resp['meta']:
            links = resp['meta']['pagination']['links']
            if 'next' in links:
                additional_params = base_params
                page_params = links['next'].split('?')[1:]
                for param in page_params:
                    (key, val) = tuple(param.split('='))
                    additional_params = merge_dicts(additional_params, {key: val})
            else:
                cont = False
        else:
            cont = False

        for data in resp['data']:
            data_func(data)


def clear_dictionary(dictionary):
    for x in dictionary.values():
        x.clear()


def dataframe_insert(dictionary, table_name):
    if len(dictionary[next(iter(dictionary))]):
        pandas.DataFrame(dictionary).to_sql(table_name, con=engine, if_exists='append', index=False)
        clear_dictionary(dictionary)


##### Dictionaries
country_dict = {
    'id': [],
    'name': [],
    'continent': []
}

venue_dict = {
    'id': [],
    'name': [],
    'city': [],
    'capacity': []
}

position_dict = {
    'id': [],
    'name': []
}

competition_dict = {
    'id': [],
    'is_cup': [],
    'country_id': [],
    'name': []
}

season_dict = {
    'id': [],
    'year': [],
    'league_id': [],
    'finished_backfill': []
}

club_dict = {
    'id': [],
    'name': [],
    'country_id': [],
    'is_national_team': [],
    'venue_id': [],
    'finished_fixture_backfill': []
}

club_season_dict = {
    'season_id': [],
    'club_id': [],
    'finished_lineup_backfill': []
}

player_dict = {
    'id': [],
    'nationality': [],
    'position_id': [],
    'name': [],
    'nickname': [],
    'birthdate': [],
    'height': [],
    'weight': []
}

player_season_dict = {
    'player_id': [],
    'season_id': [],
    'club_id': [],
    'position_id': [],
    'roster_number': [],
    'minutes_played': [],
    'appearances': [],
    'sub_apps': [],
    'goals': [],
    'assists': [],
    'yellow_cards': [],
    'yellow_red': [],
    'red_cards': [],
}

fixture_dict = {
    'id': [],
    'season_id': [],
    'venue_id': [],
    'home_team_id': [],
    'away_team_id': [],
    'date_of_game': [],
    'home_team_score': [],
    'away_team_score': []
}

player_game_dict = {
    'player_id': [],
    'fixture_id': [],
    'season_id': [],
    'club_id': [],
    'position': [],
    'minutes_played': [],
    'goals_scored': [],
    'goals_conceded': [],
    'assists': [],
    'shots_on_goal': [],
    'shots_total': [],
    'fouls_committed': [],
    'fouls_drawn': [],
    'interceptions': [],
    'saves': [],
    'clearances': [],
    'tackles': [],
    'offsides': [],
    'blocks': [],
    'yellow_cards': [],
    'red_cards': [],
    'pen_saved': [],
    'pen_missed': [],
    'pen_scored': [],
    'passes_total': [],
    'passes_accuracy': [],
    'crosses_total': [],
    'crosses_accuracy': []
}


##### Parsing Methods
def add_country_to_dictionary(id, name, continent):
    global countries, country_dict

    if id not in countries:
        country_dict['id'].append(id)
        country_dict['name'].append(name)
        country_dict['continent'].append(continent)
        countries.append(id)


def parse_country_data(data):
    global country_dict

    id = data['id']
    name = data['name']
    continent = "None"
    if 'continent' in data:
        continent = data['continent']
    elif data['extra']:
        extra = data['extra']
        if 'continent' in extra:
            continent = extra['continent']

    add_country_to_dictionary(id, name, continent)


def add_venue_to_dictionary(id, name, city, capacity):
    global venues, venue_dict

    if id not in venues:
        venue_dict['id'].append(id)
        venue_dict['name'].append(name)
        venue_dict['city'].append(city)
        venue_dict['capacity'].append(capacity)
        venues.append(id)


def parse_venue_data(data):
    global venue_dict

    id = data['id']
    name = data['name']
    city = data['city']
    capacity = data['capacity']

    add_venue_to_dictionary(id, name, city, capacity)


def parse_position_data(data):
    global position_dict, positions

    id = data['id']
    name = data['name']

    if id not in positions:
        position_dict['id'].append(id)
        position_dict['name'].append(name)
        positions.append(id)


def parse_competition_data(data):
    global competition_dict, competitions

    id = data['id']
    is_cup = data['is_cup']
    country_id = data['country_id']
    name = data['name']

    if id not in competitions:
        competition_dict['id'].append(id)
        competition_dict['is_cup'].append(is_cup)
        competition_dict['country_id'].append(country_id)
        competition_dict['name'].append(name)
        competitions.append(id)


def add_season_to_dictionary(id, year, league_id, finished_backfill):
    global season_dict, seasons, invalid_seasons

    if id not in dict(seasons) and id not in invalid_seasons:
        season_dict['id'].append(id)
        season_dict['year'].append(year)
        season_dict['league_id'].append(league_id)
        season_dict['finished_backfill'].append(finished_backfill)
        if league_id != 0:
            seasons.append((id, finished_backfill))
        else:
            invalid_seasons.append(id)


def parse_season_data(data):
    global season_dict

    id = data['id']
    year = data['name']
    league_id = data['league_id']

    add_season_to_dictionary(id, year, league_id, False)


def parse_club_data(data):
    global club_dict, clubs

    id = data['id']
    name = data['name']
    country_id = data['country_id']
    is_national_team = data['national_team']
    venue_id = data['venue_id']

    # Ensure the venue exists
    valid_country = add_country(country_id)
    add_venue(venue_id)

    if valid_country and id not in dict(clubs):
        club_dict['id'].append(id)
        club_dict['name'].append(name)
        club_dict['country_id'].append(country_id)
        club_dict['is_national_team'].append(is_national_team)
        club_dict['venue_id'].append(venue_id)
        club_dict['finished_fixture_backfill'].append(False)
        clubs.append((id, False))
    return valid_country


def parse_club_season_data(season_id, data):
    global club_season_dict, club_seasons

    valid_club = parse_club_data(data)

    if valid_club:
        club_id = data['id']

        if (season_id, club_id) not in dict(club_seasons):
            club_season_dict['season_id'].append(season_id)
            club_season_dict['club_id'].append(club_id)
            club_season_dict['finished_lineup_backfill'].append(False)

            club_seasons.append(((season_id, club_id), False))


def optional_attr(data, key, default):
    if key in data and data[key]:
        return data[key]
    return default


def parse_player_data(data):
    global player_dict, players

    id = data['player_id']

    if id not in players:
        player_dict['id'].append(id)
        player_dict['nationality'].append(optional_attr(data, 'nationality', "Invalid"))
        player_dict['position_id'].append(optional_attr(data, 'position_id', 0))
        player_dict['name'].append(optional_attr(data, 'fullname', "Unknown"))
        player_dict['nickname'].append(optional_attr(data, 'common_name', "Unknown"))
        birthdate = optional_attr(data, 'birthdate', "01/01/1700")
        try:
            birthdate = datetime.datetime.strptime(birthdate, '%d/%m/%Y').strftime('%Y-%m-%d')
        except ValueError:
            birthdate = datetime.datetime.strptime(birthdate, '%m/%d/%Y').strftime('%Y-%m-%d')
        player_dict['birthdate'].append(birthdate)

        height = optional_attr(data, 'height', "0").split(" ")[0]
        if height.strip():
            player_dict['height'].append(int(height))
        else:
            player_dict['height'].append(0)

        weight = optional_attr(data, 'weight', "0").split(" ")[0]
        if weight.strip():
            player_dict['weight'].append(int(weight))
        else:
            player_dict['weight'].append(0)

        players.append(id)


def add_player_season(player_id, season_id, club_id, position_id, roster_number, minutes_played, appearances, sub_apps,
                      goals, assists, yellow_cards, yellow_red, red_cards):
    global player_season_dict, player_seasons

    if (player_id, season_id, club_id) not in player_seasons:
        player_season_dict['player_id'].append(player_id)
        player_season_dict['season_id'].append(season_id)
        player_season_dict['club_id'].append(club_id)
        player_season_dict['position_id'].append(position_id)
        player_season_dict['roster_number'].append(roster_number)
        player_season_dict['minutes_played'].append(minutes_played)
        player_season_dict['appearances'].append(appearances)
        player_season_dict['sub_apps'].append(sub_apps)
        player_season_dict['goals'].append(goals)
        player_season_dict['assists'].append(assists)
        player_season_dict['yellow_cards'].append(yellow_cards)
        player_season_dict['yellow_red'].append(yellow_red)
        player_season_dict['red_cards'].append(red_cards)

        player_seasons.append((player_id, season_id, club_id))


def parse_lineup_data(season_id, club_id, data):
    player_id = data['player_id']
    parse_player_data(data['player']['data'])

    position_id = 0
    if 'position_id' in data:
        position_id = data['position_id']
        if 'position' in data and 'data' in data['position']:
            parse_position_data(data['position']['data'])

    add_player_season(player_id, season_id, club_id, position_id,
                      data['number'], data['minutes'], data['appearences'],
                      data['substitute_in'], data['goals'], data['assists'],
                      data['yellowcards'], data['yellowred'], data['redcards'])


def parse_fixture_lineup_data(season_id, home_id, home_goals, away_id, away_goals, data):
    global player_game_dict, player_games

    for entry in data:
        player_id = entry['player_id']
        fixture_id = entry['fixture_id']
        club_id = entry['team_id']

        if club_id != home_id and club_id != away_id:
            print("Trying to fallback to home or away id.")
            if (season_id, home_id, player_id) in player_seasons:
                club_id = home_id
            elif (season_id, away_id, player_id) in player_seasons:
                club_id = away_id
            else:
                continue

        if player_id and fixture_id and (player_id, fixture_id) not in player_games:
            position = entry['position']

            stats = entry['stats']
            shots = stats['shots']
            goals = stats['goals']
            fouls = stats['fouls']
            cards = stats['cards']
            passing = stats['passing']
            other = stats['other']

            minutes_played = other['minutes_played']
            goals_scored = optional_attr(goals, 'scored', 0)
            goals_conceded = away_goals if club_id == home_id else home_goals
            assists = optional_attr(other, 'assists', 0)
            shots_on_goal = optional_attr(shots, 'shots_on_goal', 0)
            shots_total = optional_attr(shots, 'shots_total', 0)
            fouls_committed = optional_attr(fouls, 'committed', 0)
            fouls_drawn = optional_attr(fouls, 'drawn', 0)
            interceptions = optional_attr(other, 'interceptions', 0)
            saves = optional_attr(other, 'saves', 0)
            clearances = optional_attr(other, 'clearances', 0)
            tackles = optional_attr(other, 'tackles', 0)
            offsides = optional_attr(other, 'offsides', 0)
            blocks = optional_attr(other, 'blocks', 0)
            yellow_cards = optional_attr(cards, 'yellowcards', 0)
            red_cards = optional_attr(cards, 'redcards', 0)
            pen_saved = optional_attr(other, 'pen_saved', 0)
            pen_missed = optional_attr(other, 'pen_missed', 0)
            pen_scored = optional_attr(other, 'pen_scored', 0)
            passes_total = optional_attr(passing, 'passes', 0)
            passes_accuracy = optional_attr(passing, 'passes_accuracy', 0)
            crosses_total = optional_attr(passing, 'total_crosses', 0)
            crosses_accuracy = optional_attr(passing, 'crosses_accuracy', 0)

            player_game_dict['player_id'].append(player_id)
            player_game_dict['fixture_id'].append(fixture_id)
            player_game_dict['season_id'].append(season_id)
            player_game_dict['club_id'].append(club_id)
            player_game_dict['position'].append(position)
            player_game_dict['minutes_played'].append(minutes_played)
            player_game_dict['goals_scored'].append(goals_scored)
            player_game_dict['goals_conceded'].append(goals_conceded)
            player_game_dict['assists'].append(assists)
            player_game_dict['shots_on_goal'].append(shots_on_goal)
            player_game_dict['shots_total'].append(shots_total)
            player_game_dict['fouls_committed'].append(fouls_committed)
            player_game_dict['fouls_drawn'].append(fouls_drawn)
            player_game_dict['interceptions'].append(interceptions)
            player_game_dict['saves'].append(saves)
            player_game_dict['clearances'].append(clearances)
            player_game_dict['tackles'].append(tackles)
            player_game_dict['offsides'].append(offsides)
            player_game_dict['blocks'].append(blocks)
            player_game_dict['yellow_cards'].append(yellow_cards)
            player_game_dict['red_cards'].append(red_cards)
            player_game_dict['pen_saved'].append(pen_saved)
            player_game_dict['pen_missed'].append(pen_missed)
            player_game_dict['pen_scored'].append(pen_scored)
            player_game_dict['passes_total'].append(passes_total)
            player_game_dict['passes_accuracy'].append(passes_accuracy)
            player_game_dict['crosses_total'].append(crosses_total)
            player_game_dict['crosses_accuracy'].append(crosses_accuracy)

            add_player(player_id)
            add_player_season(player_id, season_id, club_id, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1)

            player_games.append((player_id, fixture_id))


def parse_fixture_data(data):
    global fixture_dict, fixtures, club_seasons

    id = data['id']
    if id not in fixtures:
        season_id = data['season_id']
        venue_id = data['venue_id']
        home_team_id = data['localteam_id']
        away_team_id = data['visitorteam_id']

        date_of_game = data['time']['starting_at']['date']
        scores = data['scores']
        home_team_score = scores['localteam_score']
        away_team_score = scores['visitorteam_score']

        fixture_dict['id'].append(id)
        fixture_dict['season_id'].append(season_id)
        fixture_dict['venue_id'].append(venue_id)
        fixture_dict['home_team_id'].append(home_team_id)
        fixture_dict['away_team_id'].append(away_team_id)
        fixture_dict['date_of_game'].append(date_of_game)
        fixture_dict['home_team_score'].append(home_team_score)
        fixture_dict['away_team_score'].append(away_team_score)

        fixtures.append(id)

        if (season_id, home_team_id) not in dict(club_seasons):
            add_clubs_for_season(season_id)
        if (season_id, away_team_id) not in dict(club_seasons):
            add_clubs_for_season(season_id)

        add_venue(venue_id)
        parse_fixture_lineup_data(season_id, home_team_id, home_team_score, away_team_id, away_team_score, data['lineup']['data'])


##### Workflow methods
def add_country(country_id):
    global countries, country_dict

    if country_id and country_id not in countries:
        resp = sports_monks_api("/countries/{}".format(country_id), None)
        valid_country = 'data' in resp
        if valid_country:
            parse_country_data(resp['data'])
            dataframe_insert(country_dict, "Country")
        else:
            add_country_to_dictionary(country_id, "Invalid", "Invalid")
        dataframe_insert(country_dict, "Country")
        return valid_country

    return (country_id is not None)


def populate_countries():
    global countries, country_dict

    paginated_request("/countries", None, parse_country_data)
    dataframe_insert(country_dict, "Country")


def populate_competitions():
    global competitions, competition_dict

    paginated_request("/leagues", None, parse_competition_data)
    dataframe_insert(competition_dict, "Competition")


def add_season(season_id):
    global seasons, season_dict

    if not season_id:
        return False
    if season_id in invalid_seasons:
        return False
    elif season_id not in dict(seasons):
        resp = sports_monks_api("/seasons/{}".format(season_id), None)
        is_valid_season = 'data' in resp
        if is_valid_season:
            parse_season_data(resp['data'])
        else:
            add_season_to_dictionary(season_id, "Invalid", 0, True)
        dataframe_insert(season_dict, "Season")
        return is_valid_season

    return True


def populate_seasons():
    global seasons, season_dict

    paginated_request("/seasons", None, parse_season_data)
    dataframe_insert(season_dict, "Season")


def add_venue(venue_id):
    global venues

    if venue_id and venue_id not in venues:
        resp = sports_monks_api("/venues/{}".format(venue_id), None)
        valid_venue = 'data' in resp
        if valid_venue:
            parse_venue_data(resp['data'])
        else:
            add_venue_to_dictionary(venue_id, "Invalid", "Invalid", 0)


def add_clubs_for_season(season_id):
    global venue_dict, club_dict, club_season_dict

    paginated_request("/teams/season/{}".format(season_id), None,
                      (lambda x: parse_club_season_data(season_id, x)))

    # Add venues
    dataframe_insert(venue_dict, "Venue")

    # Add clubs
    dataframe_insert(club_dict, "Club")

    # Add club seasons
    dataframe_insert(club_season_dict, "ClubSeason")


def populate_club_seasons():
    global seasons

    for ndx, (season_id, finished_backfill) in enumerate(seasons):
        if not finished_backfill:
            add_clubs_for_season(season_id)

            seasons[ndx] = (season_id, True)
            engine.execute("UPDATE Season SET finished_backfill=true WHERE id='{}'".format(season_id))


def add_player(player_id):
    global players

    if player_id not in players:
        resp = sports_monks_api("/players/{}".format(player_id), {'include': 'position'})
        parse_player_data(resp['data'])


def populate_lineups():
    global club_seasons, position_dict, player_dict, player_season_dict

    for ndx, ((season_id, club_id), finished_lineup_backfill) in enumerate(club_seasons):
        if not finished_lineup_backfill:
            paginated_request("/squad/season/{}/team/{}".format(season_id, club_id), {'include': 'position,player'},
                              (lambda x: parse_lineup_data(season_id, club_id, x)))

            # Add positions
            dataframe_insert(position_dict, "Position")

            # Add Players
            dataframe_insert(player_dict, "Player")

            # Add Player Season
            dataframe_insert(player_season_dict, "PlayerSeason")

            club_seasons[ndx] = ((season_id, club_id), True)
            engine.execute(
                "UPDATE ClubSeason SET finished_lineup_backfill=true WHERE season_id='{}' AND club_id='{}'".format(
                    season_id,
                    club_id))


def populate_fixtures():
    global clubs, venue_dict, player_dict, player_season_dict, fixture_dict, player_game_dict

    for ndx, (club_id, finished_fixture_backfill) in enumerate(clubs):
        if not finished_fixture_backfill:
            paginated_request("/fixtures/between/2016-08-01/2018-03-07/{}".format(club_id),
                              {'include': 'lineup,substitution'},
                              (lambda x: parse_fixture_data(x)))

            # Add venues
            dataframe_insert(venue_dict, "Venue")

            # Add Player
            dataframe_insert(player_dict, "Player")

            # Add player season if necessary
            dataframe_insert(player_season_dict, "PlayerSeason")

            # Add fixtures
            dataframe_insert(fixture_dict, "Fixture")

            # Add Players
            dataframe_insert(player_game_dict, "PlayerGame")

            club_seasons[ndx] = (club_id, True)
            engine.execute("UPDATE Club SET finished_fixture_backfill=true WHERE id='{}'".format(club_id))


# populate_countries()
# populate_competitions()
# populate_seasons()
# populate_club_seasons()
# populate_lineups()
populate_fixtures()

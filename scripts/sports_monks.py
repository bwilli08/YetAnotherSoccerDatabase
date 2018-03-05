#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

import sys
import pandas
import requests
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
countries = convert_sql_result_to_set("SELECT id FROM Country", (lambda x: x[0]))


##### Helper Functions
def merge_dicts(x, y):
    if not x:
        return y
    elif not y:
        return x
    else:
        z = x.copy()   # start with x's keys and values
        z.update(y)    # modifies z with y's keys and values & returns None
        return z

def sports_monks_api(api_string, additional_params):
    params = merge_dicts(token_param, additional_params)
    return requests.get(base_url + api_string, headers=headers, params=params).json()

def paginated_request(api_endpoint, base_params, data_func):
    additional_params = base_params
    cont = True

    while cont:
        resp = sports_monks_api(api_endpoint, additional_params)

        links = resp['meta']['pagination']['links']
        if 'next' in links:
            additional_params = base_params
            page_params = links['next'].split('?')[1:]
            for param in page_params:
                (key, val) = tuple(param.split('='))
                additional_params = merge_dicts(additional_params, {key: val})
        else:
            cont = False

        data_func(resp['data'])


##### Dictionaries
country_dict = {
    'id': [],
    'name': [],
    'continent': []
}


##### Workflow Methods
def parse_country_data(data_list):
    for country in data_list:
        id = country['id']
        name = country['name']
        continent = "None"
        if 'continent' in country:
            continent = country['continent']
        elif country['extra']:
            extra = country['extra']
            if 'continent' in extra:
                continent = extra['continent']

        if id not in countries:
            country_dict['id'].append(id)
            country_dict['name'].append(name)
            country_dict['continent'].append(continent)

def populate_countries():
    paginated_request("/countries", None, parse_country_data)
    pandas.DataFrame(country_dict).to_sql("Country", con=engine, if_exists='append', index=False)


def populate_competitions():
    print()

def populate_seasons():
    print()

def populate_clubs():
    print()

def add_venue(venue_id):
    print()

def add_club_season(season_id, club_id):
    print()

def add_player(player_id):
    print()

def add_player_game(game_json, started):
    print()

def populate_fixtures():
    print()

populate_countries()
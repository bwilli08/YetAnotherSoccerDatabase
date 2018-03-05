#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

import json
import requests

headers = {'Accept': 'application/json'}
params = {'include': 'fixtures', 'api_token': 'FaoR0NXWoaCC0r1JEHVhLOudUTrFcacax14DQw4S3T8aI4dRFc6u7gwJ8rjH'}
r = requests.get("https://soccer.sportmonks.com/api/v2.0/seasons", headers=headers, params=params)

print(json.dumps(r.json(), indent=2))

def populate_countries():
    print()

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
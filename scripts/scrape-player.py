#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

from bs4 import BeautifulSoup
import requests
import pandas as pd
import time

player_table = {
        'name' : [],
        'position' : [],
        'height' : [],
        'date_of_birth' : []
        }

club_table = {
        'squad' : []
        }

# I should probably create my own internal id structure instead of just using "2013-14" and "Tottenham Hotspur F.C." as the Primary Keys
club_season_table = {
        'squad' : [],
        'season' : []
        }

player_stat_table = {
        'season' : [],
        'squad' : [],
        'comp' : [],
        'age' : [],
        'games' : [],
        'games_starts' : [],
        'games_subs' : [],
        'minutes_per_game' : [],
        'goals' : [],
        'assists' : [],
        'fouls' : [],
        'cards_yellow' : [],
        'cards_red' : [],
        'shots_on_target' : []
        }

base_url = "https://fbref.com"
base_player_url = "/en/players/"
base_squad_url = "/en/squads/"

# Track the already parsed players and seasons here
to_do_team_seasons = set()
finished_players = set()

# Utility method used to populate the above to_do_team_seasons list. Each entry is not guaranteed to actually exist.
def populate_team_seasons():
    # Use Harry Kane as a base, just to grab every season and team
    url = base_url + base_player_url + "21a66f6a"
    soup = BeautifulSoup(requests.get(url).text)

    # Extract all listed teams from the webpage
    team_ids = set(map((lambda x: x['value']), soup.find_all('select', attrs={"name": "squad"})[0].find_all('option')[1:]))

    # Extract all known seasons from the webpage
    seasons = set(map((lambda x: x['value']), soup.find_all('select', attrs={"name": "season"})[0].find_all('option')[1:]))

    # Permute through each of the above and add an entry to the seasons list
    for team_id in team_ids:
        for season in seasons:
            to_do_team_seasons.add(base_squad_url + team_id + "/" + season)

# BEGIN: Rest of backfill methods
def conditional_add(orig, dest, obj):
    if obj not in orig:
        dest.add(obj)

def add_or_null(obj, func, arr):
    if obj is not None:
        arr.append(func(obj))
    else:
        arr.append("null")

def add_position(html):
    for p in html:
        if "Position" in p.get_text():
            player_table['position'].append(p.get_text().replace("Position: ", "")[:2])
            return

def add_player_meta(player_id, meta):
    player_table['name'].append(meta.find(itemprop='name').get_text())
    add_position(meta.find_all('p'))
    add_or_null(meta.find('span', itemprop='height'), (lambda x: x.get_text()), player_table['height'])
    add_or_null(meta.find('span', itemprop='birthDate'), (lambda x: x['data-birth']), player_table['date_of_birth'])

def append_stat(stat, stat_name):
    player_stat_table[stat_name].append(stat.get_text())

def add_stat(html, stat_name):
    stat = html.find(attrs={"data-stat" : stat_name})

    append_stat(stat, stat_name)

def parse_stat_entry(stat):
    add_stat(stat, 'season')
    add_stat(stat, 'squad')
    add_stat(stat, 'comp')
    add_stat(stat, 'age')
    add_stat(stat, 'games')
    add_stat(stat, 'games_starts')
    add_stat(stat, 'games_subs')
    add_stat(stat, 'minutes_per_game')
    add_stat(stat, 'goals')
    add_stat(stat, 'assists')
    add_stat(stat, 'fouls')
    add_stat(stat, 'cards_yellow')
    add_stat(stat, 'cards_red')
    add_stat(stat, 'shots_on_target')

def backfill_player(player_id):
    url = base_url + player_id
    soup = BeautifulSoup(requests.get(url).text)

    meta = soup.find('div', itemtype='https://schema.org/Person')
    add_player_meta(player_id, meta)

    # FIXME: For now, ignore goalkeepers. However, we should parse their data separately.
    #if player_table['position'][-1] == "GK":
    #
    if player_table['position'][-1] != "GK":
        # Get stats table, ignore first row since its headers
        stats = soup.find_all('table')[0].find_all('tr')[1:]

        # Parse through each year of the player's career
        for stat in stats:
            parse_stat_entry(stat)

        finished_players.add(player_id)

def run_backfill():
    #while to_do_team_seasons:
        season = to_do_team_seasons.pop()
        url = base_url + base_squad_url + "361ca564/2013-2014"

        # request the webpage and transform it through BeautifulSoup.
        soup = BeautifulSoup(requests.get(url).text)
        stat_table = soup.find('table', attrs={"id": "stats"})

        # Since the webpage exists even if the season+squad is invalid, we need to check if the stats table is present
        if stat_table is not None:
            meta = soup.find('div', attrs={"class": "squads"}).find('h1', itemprop="name").find_all('span')
            season = meta[0].get_text()
            squad = meta[1].get_text()

            club_table['squad'].append(squad)

            club_season_table['squad'].append(squad)
            club_season_table['season'].append(season)

            players = stat_table.find('tbody').find_all('tr')

            for player in players:
                href = player.find('a', href=True)
                if href is not None and hasattr(href, 'href'):
                    player_ref = href['href']

                    if not (player_ref in finished_players):
                        print("Backfilling: " + player_ref)
                        backfill_player(player_ref)

        time.sleep(1)

populate_team_seasons()
run_backfill()

pst_df = pd.DataFrame(data=player_stat_table)
print(pst_df)
#backfill_player("21a66f6a")
#backfill_team(to_do_team_seasons.pop())




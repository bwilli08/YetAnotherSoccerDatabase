#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

from bs4 import BeautifulSoup
from sqlalchemy import create_engine
import mysql.connector
import time
import sys
import requests
import pandas
import datetime

##### Global Variables #####

# Verbose Flag
verbose = False

# We need to keep track of this in order to mirror the auto-incrementing MySQL ID
cur_player_id = 1

# URL prefixes
base_url = "https://fbref.com"
base_player_url = "/en/players/"
base_squad_url = "/en/squads/"

# Track the already parsed players and seasons here
to_do_team_seasons = set()
to_do_players = set()

# engine for sql queries
engine = create_engine('mysql+mysqlconnector://wilbren:Aug9th95@localhost/seniorproject')

##### Pandas DataFrame Dictionaries #####

player_table = {
    'player_id': [],
    'name': [],
    'position': [],
    'height': [],
    'date_of_birth': [],
    'fbref_id': []
}

club_table = {
    'squad': []
}

club_season_table = {
    'squad': [],
    'season': [],
    'fbref_id': []
}

player_stat_table = {
    'player_id': [],
    'season': [],
    'squad': [],
    'comp': [],
    'age': [],
    'games': [],
    'games_starts': [],
    'games_subs': [],
    'minutes_per_game': [],
    'goals': [],
    'assists': [],
    'fouls': [],
    'cards_yellow': [],
    'cards_red': [],
    'shots_on_target': []
}

goalkeeper_stat_table = {
    'player_id': [],
    'season': [],
    'squad': [],
    'comp': [],
    'age': [],
    'games': [],
    'games_starts': [],
    'games_subs': [],
    'minutes_per_game': [],
    'save_perc': [],
    'clean_sheets': [],
    'cards_yellow': [],
    'cards_red': [],
}


##### Backfill Methods #####

# Utility method used to populate the above to_do_team_seasons list. Each entry is not guaranteed to actually exist.
def populate_team_seasons():
    if verbose:
        print("Populating squad and season lists.")

    # Use Harry Kane as a base, just to grab every season and team
    url = base_url + base_player_url + "21a66f6a"
    soup = BeautifulSoup(requests.get(url).text)

    # Extract all listed teams from the webpage
    team_ids = set(
        map((lambda x: x['value']), soup.find_all('select', attrs={"name": "squad"})[0].find_all('option')[1:]))
    if verbose:
        print("Found " + str(len(team_ids)) + " squads.")

    # Extract all known seasons from the webpage
    seasons = set(
        map((lambda x: x['value']), soup.find_all('select', attrs={"name": "season"})[0].find_all('option')[1:]))
    if verbose:
        print("Found " + str(len(seasons)) + " seasons.")

    # Permute through each of the above and add an entry to the seasons list
    for team_id in team_ids:
        for season in seasons:
            to_do_team_seasons.add(base_squad_url + team_id + "/" + season)

    if verbose:
        print("Found " + str(len(to_do_team_seasons)) + " possible squad and season combinations.")


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
    player_table['position'].append("??")


def add_player_meta(player_id, meta):
    player_table['player_id'].append(cur_player_id)
    player_table['name'].append(meta.find(itemprop='name').get_text())
    add_position(meta.find_all('p'))
    add_or_null(meta.find('span', itemprop='height'), (lambda x: x.get_text()), player_table['height'])
    add_or_null(meta.find('span', itemprop='birthDate'), (lambda x: x['data-birth']), player_table['date_of_birth'])
    player_table['fbref_id'].append(player_id)


def append_stat(stat, stat_name, target_dictionary):
    target_dictionary[stat_name].append(stat)


def add_stat(html, stat_name, target_dictionary):
    stat = html.find(attrs={"data-stat": stat_name})

    append_stat(stat.get_text(), stat_name, target_dictionary)


def parse_stat_entry(stat, isGK):
    target_dictionary = goalkeeper_stat_table if isGK else player_stat_table

    # Don't add any of these stats for goalkeepers, since they're found in the GK table
    if not isGK:
        append_stat(cur_player_id, 'player_id', target_dictionary)
        add_stat(stat, 'season', target_dictionary)
        add_stat(stat, 'squad', target_dictionary)
        add_stat(stat, 'comp', target_dictionary)
        add_stat(stat, 'age', target_dictionary)
        add_stat(stat, 'games', target_dictionary)
        add_stat(stat, 'goals', target_dictionary)
        add_stat(stat, 'assists', target_dictionary)
        add_stat(stat, 'fouls', target_dictionary)
        add_stat(stat, 'shots_on_target', target_dictionary)
        add_stat(stat, 'minutes_per_game', target_dictionary)
        add_stat(stat, 'cards_yellow', target_dictionary)
        add_stat(stat, 'cards_red', target_dictionary)

    add_stat(stat, 'games_starts', target_dictionary)
    add_stat(stat, 'games_subs', target_dictionary)


def add_optional_gk_stats():
    append_stat("null", 'games_starts', goalkeeper_stat_table)
    append_stat("null", 'games_subs', goalkeeper_stat_table)


def parse_gk_stat_entry(stat):
    append_stat(cur_player_id, 'player_id', goalkeeper_stat_table)
    add_stat(stat, 'season', goalkeeper_stat_table)
    add_stat(stat, 'squad', goalkeeper_stat_table)
    add_stat(stat, 'comp', goalkeeper_stat_table)
    add_stat(stat, 'age', goalkeeper_stat_table)
    add_stat(stat, 'games', goalkeeper_stat_table)
    add_stat(stat, 'minutes_per_game', goalkeeper_stat_table)
    add_stat(stat, 'cards_yellow', goalkeeper_stat_table)
    add_stat(stat, 'cards_red', goalkeeper_stat_table)
    add_stat(stat, 'save_perc', goalkeeper_stat_table)
    add_stat(stat, 'clean_sheets', goalkeeper_stat_table)


def backfill_player(player_id):
    try:
        url = base_url + player_id
        soup = BeautifulSoup(requests.get(url).text)

        meta = soup.find('div', itemtype='https://schema.org/Person')
        add_player_meta(player_id, meta)

        # Check for goalkeepers and parse them differently
        if player_table['position'][-1] != "GK":
            # Get stats table, ignore first row since its headers
            stats = soup.find('table', attrs={"id": "stats"}).find_all('tr')[1:]

            # Parse through each year of the player's career
            for stat in stats:
                parse_stat_entry(stat, False)
        else:
            gk_table = soup.find('table', attrs={"id": "stats_keeper"})
            if gk_table is None:
                # Some GKs don't have stats. Ignore these players.
                return
            gk_stats = gk_table.find_all('tr')[1:]
            outfield_stats = soup.find('table', attrs={"id": "stats"}).find_all('tr')[1:]

            for ndx in range(0, len(gk_stats)):
                parse_gk_stat_entry(gk_stats[ndx])
                if len(outfield_stats) > ndx:
                    parse_stat_entry(outfield_stats[ndx], True)
                else:
                    add_optional_gk_stats()

        global cur_player_id
        cur_player_id += 1
    except requests.exceptions.ConnectionError:
        print("Could not read " + player_id + ". Hopefully retrying later. Sleeping for five seconds.")
        time.sleep(5)
        return


def run_backfill():
    found = False

    while not found:
    #while to_do_team_seasons:
        fbref_id = to_do_team_seasons.pop()
        url = base_url + fbref_id

        try:
            # request the webpage and transform it through BeautifulSoup.
            soup = BeautifulSoup(requests.get(url).text)
            stat_table = soup.find('table', attrs={"id": "stats"})

            # Since the webpage exists even if the season+squad is invalid, we need to check if the stats table is present
            if stat_table is not None:
                meta = soup.find('div', attrs={"class": "squads"}).find('h1', itemprop="name").find_all('span')
                season = meta[0].get_text()
                squad = meta[1].get_text()

                if verbose:
                    print("Adding " + squad + " (" + season + ") to tables.")

                club_table['squad'].append(squad)

                club_season_table['squad'].append(squad)
                club_season_table['season'].append(season)
                club_season_table['fbref_id'].append(fbref_id)

                players = stat_table.find('tbody').find_all('tr')

                for player in players:
                    href = player.find('a', href=True)
                    if href is not None and hasattr(href, 'href'):
                        to_do_players.add(href['href'])

                found = True
            elif verbose:
                print("Empty entry found: " + fbref_id)

        except requests.exceptions.ConnectionError:
            print("Could not read " + url + ". Adding back to the seasons set. Sleeping for five seconds.")
            time.sleep(5)
            to_do_team_seasons.append(season)

    c_df = pandas.DataFrame(data=club_table)
    c_df.to_sql(name="Club", con=engine.raw_connection(), flavor='mysql', if_exists="append")

    #print(str(len(club_season_table['squad'])))
    # The above .to_sql statement works correctly. I can use the sql engine to not backfill players and club seasons that already exist
'''
    cs_df = pandas.DataFrame(data=club_season_table)
    cs_df.to_csv('ClubSeason.csv')

    print(str(len(to_do_players)))

    while to_do_players:
        player_ref = to_do_players.pop()
        # TODO: WEAKLY REFERENCED OBJECT NO LONGER EXISTS
        db_conn = sql.connect(host='localhost', database='SeniorProject', user='wilbren', password='Aug9th95')
        cursor = db_conn.cursor()

        sql_query = "SELECT COUNT(*) FROM Player WHERE fbref_id='{}'".format(player_ref)
        print(sql_query)
        cursor.execute(sql_query)
        print(cursor.fetchone())

        if verbose:
            print("\tBackfilling: " + player_ref + " [" + str(cur_player_id) + "] {" + str(
                    datetime.datetime.now()) + "}")
        backfill_player(player_ref)

    pt_df = pandas.DataFrame(data=player_table)
    pt_df.to_csv('Player.csv')

    pst_df = pandas.DataFrame(data=player_stat_table)
    pst_df.to_csv('OutfieldPlayerStat.csv')

    gst_df = pandas.DataFrame(data=goalkeeper_stat_table)
    gst_df.to_csv('GoalkeeperStat.csv')
'''

##### Backfill Core Workflow #####

if not set(sys.argv).isdisjoint(['-v', '--verbose']):
    print("Verbose flag set to true, printing log messages.")
    verbose = True

populate_team_seasons()
run_backfill()

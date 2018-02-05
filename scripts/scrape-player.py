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
import copy

##### Global Variables #####

# Verbose Flag
verbose = None
if not set(sys.argv).isdisjoint(['-v', '--verbose']):
    print("Verbose flag set to true, printing log messages.")
    verbose = True
else:
    verbose = False

# URL prefixes
base_url = "https://fbref.com"
base_player_url = "/en/players/"
base_squad_url = "/en/squads/"

# engine for sql queries
engine = create_engine('mysql+mysqlconnector://wilbren:Aug9th95@localhost/seniorproject')


def convert_sql_result_to_list(statement, ndx):
    return list(map((lambda x: x[ndx]), engine.execute(statement).fetchall()))


def convert_sql_result_to_set(statement, ndx):
    return set(map((lambda x: x[ndx]), engine.execute(statement).fetchall()))


existing_seasons = convert_sql_result_to_list("SELECT DISTINCT fbref_id FROM ClubSeason WHERE finished_backfill=true", 0)
garbage_seasons = convert_sql_result_to_list("SELECT DISTINCT fbref_id FROM GarbageSeason", 0)
backfilled_seasons = existing_seasons + garbage_seasons
backfilled_players = convert_sql_result_to_list("SELECT DISTINCT fbref_id FROM TempPlayer WHERE finished_backfill=true", 0)

# Track the already parsed players and seasons here
current_squads = convert_sql_result_to_set("SELECT DISTINCT squad FROM Club", 0)
partial_seasons = convert_sql_result_to_set("SELECT DISTINCT fbref_id FROM ClubSeason WHERE finished_backfill=false", 0)
to_do_team_seasons = copy.copy(partial_seasons)
finished_meta = engine.execute("SELECT player_id,fbref_id FROM Player").fetchall()
to_do_players = convert_sql_result_to_set("SELECT DISTINCT fbref_id FROM TempPlayer WHERE finished_backfill=false", 0)

# We need to keep track of this in order to mirror the auto-incrementing MySQL ID
max_player_id_res = engine.execute("SELECT MAX(player_id) from PLAYER").fetchone()
cur_player_id = max_player_id_res[0] + 1 if max_player_id_res[0] is not None else 1


##### Pandas DataFrame Logic #####
def add_to_database(table_name, data_frame):
    data_frame.to_sql(name=table_name, con=engine.raw_connection(), flavor="mysql", if_exists="append")


player_table = {
    'player_id': [],
    'name': [],
    'position': [],
    'height': [],
    'date_of_birth': [],
    'fbref_id': []
}


def clear_meta_dict():
    player_table['player_id'].clear()
    player_table['name'].clear()
    player_table['position'].clear()
    player_table['height'].clear()
    player_table['date_of_birth'].clear()
    player_table['fbref_id'].clear()


def update_db_player():
    add_to_database("Player", pandas.DataFrame(player_table))

    clear_meta_dict()


temp_player_table = {
    'fbref_id': [],
    'finished_backfill': []
}


def update_db_temp_player():
    add_to_database("TempPlayer", pandas.DataFrame(temp_player_table))

    temp_player_table['fbref_id'].clear()
    temp_player_table['finished_backfill'].clear()


club_table = {
    'squad': []
}


def update_db_club():
    add_to_database("Club", pandas.DataFrame(club_table))

    club_table['squad'].clear()


garbage_season_table = {
    'fbref_id': []
}


def update_db_garbage_season():
    add_to_database("GarbageSeason", pandas.DataFrame(garbage_season_table))

    garbage_season_table['fbref_id'].clear()


club_season_table = {
    'squad': [],
    'season': [],
    'fbref_id': [],
    'finished_backfill': []
}


def update_db_club_season():
    add_to_database("ClubSeason", pandas.DataFrame(club_season_table))

    club_season_table['squad'].clear()
    club_season_table['season'].clear()
    club_season_table['fbref_id'].clear()
    club_season_table['finished_backfill'].clear()


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


def update_db_outfield_player_stat():
    add_to_database("OutfieldPlayerStat", pandas.DataFrame(player_stat_table))

    player_stat_table['player_id'].clear()
    player_stat_table['season'].clear()
    player_stat_table['squad'].clear()
    player_stat_table['comp'].clear()
    player_stat_table['age'].clear()
    player_stat_table['games'].clear()
    player_stat_table['games_starts'].clear()
    player_stat_table['games_subs'].clear()
    player_stat_table['minutes_per_game'].clear()
    player_stat_table['goals'].clear()
    player_stat_table['assists'].clear()
    player_stat_table['fouls'].clear()
    player_stat_table['cards_yellow'].clear()
    player_stat_table['cards_red'].clear()
    player_stat_table['shots_on_target'].clear()


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


def update_db_goalkeeper_stat():
    add_to_database("GoalkeeperPlayerStat", pandas.DataFrame(goalkeeper_stat_table))

    goalkeeper_stat_table['player_id'].clear()
    goalkeeper_stat_table['season'].clear()
    goalkeeper_stat_table['squad'].clear()
    goalkeeper_stat_table['comp'].clear()
    goalkeeper_stat_table['age'].clear()
    goalkeeper_stat_table['games'].clear()
    goalkeeper_stat_table['games_starts'].clear()
    goalkeeper_stat_table['games_subs'].clear()
    goalkeeper_stat_table['minutes_per_game'].clear()
    goalkeeper_stat_table['save_perc'].clear()
    goalkeeper_stat_table['clean_sheets'].clear()
    goalkeeper_stat_table['cards_yellow'].clear()
    goalkeeper_stat_table['cards_red'].clear()


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
            fbref_id = base_squad_url + team_id + "/" + season
            if fbref_id not in backfilled_seasons:
                to_do_team_seasons.add(base_squad_url + team_id + "/" + season)

    if verbose:
        print("Found " + str(
            len(to_do_team_seasons)) + " possible squad and season combinations that haven't been backfilled.")


def conditional_add(orig, dest, obj):
    if obj not in orig:
        dest.add(obj)


def add_or_default(obj, func, arr, default):
    if obj is not None:
        arr.append(func(obj))
    else:
        if verbose:
            print("Defaulting to " + default)
        arr.append(default)


def add_position(html):
    for p in html:
        if "Position" in p.get_text():
            player_table['position'].append(p.get_text().replace("Position: ", "")[:2])
            return
    player_table['position'].append("??")


def add_player_meta(player_id, fbref_id, meta):
    player_table['player_id'].append(player_id)
    player_table['name'].append(meta.find(itemprop='name').get_text())
    add_position(meta.find_all('p'))
    add_or_default(meta.find('span', itemprop='height'), (lambda x: int(x.get_text().replace("cm", "").strip())),
                player_table['height'], str(0))
    add_or_default(meta.find('span', itemprop='birthDate'), (lambda x: x['data-birth']), player_table['date_of_birth'], "01-01-1970")
    player_table['fbref_id'].append(fbref_id)


def append_stat(stat, stat_name, target_dictionary):
    target_dictionary[stat_name].append(stat)


def add_stat(html, stat_name, target_dictionary):
    stat = html.find(attrs={"data-stat": stat_name})

    append_stat(stat.get_text(), stat_name, target_dictionary)


def parse_stat_entry(stat, player_id, isGK):
    target_dictionary = goalkeeper_stat_table if isGK else player_stat_table

    # Don't add any of these stats for goalkeepers, since they're found in the GK table
    if not isGK:
        append_stat(player_id, 'player_id', target_dictionary)
        # Need to check if this season + squad exists, and backfill it if not
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
    append_stat(None, 'games_starts', goalkeeper_stat_table)
    append_stat(None, 'games_subs', goalkeeper_stat_table)


def parse_gk_stat_entry(player_id, stat):
    append_stat(player_id, 'player_id', goalkeeper_stat_table)
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


def tuple_list_contains(lst, val, ndx):
    for tuple in lst:
        if tuple[ndx] == val:
            return True
    return False


def tuple_list_get(lst, val, ndx):
    for tuple in lst:
        if tuple[ndx] == val:
            return tuple
    return None


def backfill_player(fbref_id):
    try:
        global cur_player_id
        is_new_player = None
        player_id = None
        if tuple_list_contains(finished_meta, fbref_id, 1):
            player_id = tuple_list_get(finished_meta, fbref_id, 1)[0]
            is_new_player = False
        else:
            player_id = cur_player_id
            is_new_player = True

        if verbose:
            new_player_str = "new player " if is_new_player else ""
            print("Backfilling " + new_player_str + fbref_id + " [" + str(player_id) + "]")

        url = base_url + fbref_id
        soup = BeautifulSoup(requests.get(url).text)

        meta = soup.find('div', itemtype='https://schema.org/Person')
        add_player_meta(player_id, fbref_id, meta)
        position = player_table['position'][-1]
        if is_new_player:
            update_db_player()
            finished_meta.append((player_id, fbref_id))
        else:
            clear_meta_dict()

        # Check for goalkeepers and parse them differently
        if position != "GK":
            # Get stats table, ignore first row since its headers
            stats = soup.find('table', attrs={"id": "stats"}).find_all('tr')[1:]

            # Parse through each year of the player's career
            for stat in stats:
                parse_stat_entry(stat, player_id, False)

            try:
                update_db_outfield_player_stat()
            except mysql.connector.errors.IntegrityError:
                if verbose:
                    print("error saving entry for " + str(player_id))
        else:
            gk_table = soup.find('table', attrs={"id": "stats_keeper"})
            if gk_table is None:
                # Some GKs don't have stats. Ignore these players.
                return
            gk_stats = gk_table.find_all('tr')[1:]
            outfield_stats = soup.find('table', attrs={"id": "stats"}).find_all('tr')[1:]

            for ndx in range(0, len(gk_stats)):
                parse_gk_stat_entry(player_id, gk_stats[ndx])
                if len(outfield_stats) > ndx:
                    parse_stat_entry(outfield_stats[ndx], player_id, True)
                else:
                    add_optional_gk_stats()

            try:
                update_db_goalkeeper_stat()
            except mysql.connector.errors.IntegrityError:
                if verbose:
                    print("error saving entry for " + str(player_id))

        engine.execute("UPDATE TempPlayer SET finished_backfill=true WHERE fbref_id='{}'".format(player_id))

        if is_new_player:
            cur_player_id += 1
    except requests.exceptions.ConnectionError:
        print("Could not read " + player_id + ". Hopefully retrying later. Sleeping for five seconds.")
        time.sleep(5)
        return


def populate_club_and_temp_player_tables():
    global verbose

    while to_do_team_seasons:
        fbref_id = to_do_team_seasons.pop()
        url = base_url + fbref_id

        # request the webpage and transform it through BeautifulSoup.
        soup = BeautifulSoup(requests.get(url).text)
        stat_table = soup.find('table', attrs={"id": "stats"})

        # Since the webpage exists even if the season+squad is invalid, we need to check if the stats table is present
        if stat_table is not None:
            meta = soup.find('div', attrs={"class": "squads"}).find('h1', itemprop="name").find_all('span')
            season = meta[0].get_text()
            squad = meta[1].get_text()

            if verbose:
                print("Adding " + squad + " (" + season + ") to tables. {" + fbref_id + "}")

            if squad not in current_squads:
                club_table['squad'].append(squad)
                update_db_club()
                current_squads.add(squad)

            if fbref_id not in backfilled_seasons:
                if fbref_id not in partial_seasons:
                    club_season_table['squad'].append(squad)
                    club_season_table['season'].append(season)
                    club_season_table['fbref_id'].append(fbref_id)
                    club_season_table['finished_backfill'].append(False)
                    update_db_club_season()
                backfilled_seasons.append(fbref_id)

            players = stat_table.find('tbody').find_all('tr')

            for player in players:
                href = player.find('a', href=True)
                if href is not None and hasattr(href, 'href'):
                    player_href = href['href']
                    if player_href not in backfilled_players and player_href not in to_do_players:
                        to_do_players.add(player_href)
                        temp_player_table['fbref_id'].append(player_href)
                        temp_player_table['finished_backfill'].append(False)

            update_db_temp_player()

            if verbose:
                print("Finished backfilling " + squad + " (" + season + ")")

            engine.execute(
                "UPDATE ClubSeason SET finished_backfill=true WHERE squad='{}' AND season='{}'".format(squad, season))
        elif verbose:
            print("Empty entry found: " + fbref_id)

            garbage_season_table['fbref_id'].append(fbref_id)
            update_db_garbage_season()


##### Backfill Core Workflow #####
if verbose:
    print("Backfilled seasons: " + str(len(backfilled_seasons)))
    print("Partially backfilled seasons: " + str(partial_seasons))
    print("Backfilled players: " + str(len(backfilled_players)))
    print("Current player id: " + str(cur_player_id))

populate_team_seasons()
populate_club_and_temp_player_tables()
while to_do_players:
    backfill_player(to_do_players.pop())

#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

import calendar
import pandas
import sys
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.common.exceptions import SessionNotCreatedException
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.chrome.options import Options
from sqlalchemy import create_engine

sys.path.insert(0, '../internal')
import databaseinfo

# Global Engine Object
engine = create_engine('mysql+mysqlconnector://{}:{}@{}/{}'.format(
    databaseinfo.db_user(),
    databaseinfo.db_passwd(),
    databaseinfo.db_host(),
    databaseinfo.db_name()))


def convert_sql_result_to_list(statement, fun):
    return list(map(fun, engine.execute(statement).fetchall()))


def convert_sql_result_to_set(statement, fun):
    return set(map(fun, engine.execute(statement).fetchall()))


# Track global state of Database tables
competition_table = convert_sql_result_to_set("SELECT fl_ref, comp_id, finished_backfill FROM Competition",
                                              (lambda x: (x[0], (x[1], x[2]))))
club_table = convert_sql_result_to_set("SELECT fl_ref, club_id FROM Club", (lambda x: (x[0], x[1])))
player_table = convert_sql_result_to_set("SELECT fl_ref, player_id FROM Player", (lambda x: (x[0], x[1])))
club_season_table = convert_sql_result_to_set("SELECT fl_ref, club_id, comp_id, players_backfilled FROM ClubSeason",
                                              (lambda x: (x[0], (x[1], x[2], x[3]))))
game_table = convert_sql_result_to_set("SELECT fl_ref, game_id FROM Game", (lambda x: (x[0], x[1])))

# Global Headless Driver
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("log-level=3")
chrome_options.add_argument(
    "load-extension=C:/Users/Brent Williams/AppData/Local/Google/Chrome/User Data/Default/Extensions/gighmmpiobklfepjocnamgkkbiglidom")

# Month to Num dictionary - Used because football-lineups.com stores dates in DD-Mon-YY format
month_dict = {v: k for k, v in enumerate(calendar.month_abbr)}

# Global Football-Lineups Information
base_url = "https://www.football-lineups.com"
tournaments_page_suffix = "/tournaments/"


##### DataFrame Dictionary Objects
def clear_dictionary(dictionary):
    for x in dictionary.values():
        x.clear()


# Club
def add_to_club_table():
    global club_table

    new_refs = club_dictionary['table_structure']['fl_ref']

    print("New club refs:" + str(new_refs))

    if new_refs:
        refs = []
        for fl_ref in new_refs:
            refs.append("'{}'".format(fl_ref))
        qry_str = ", ".join(refs)

        qry = 'SELECT fl_ref, club_id FROM Club WHERE fl_ref in ({})'.format(qry_str)

        club_table = club_table.union(convert_sql_result_to_set(qry, (lambda x: (x[0], x[1]))))


def clear_club_dictionary():
    clear_dictionary(club_dictionary['table_structure'])


club_dictionary = {
    'table_name': "Club",
    'add_to_variable_table_method': add_to_club_table,
    'clear_method': clear_club_dictionary,
    'table_structure': {
        'club_name': [],
        'stadium': [],
        'country': [],
        'fl_ref': []
    },
    'variable_table': club_table
}


# Competition
def add_to_competition_table():
    global competition_table

    new_refs = competition_dictionary['table_structure']['fl_ref']

    if new_refs:
        refs = []
        for fl_ref in new_refs:
            refs.append("'{}'".format(fl_ref))
        qry_str = ", ".join(refs)

        qry = 'SELECT fl_ref, comp_id, finished_backfill FROM Competition WHERE fl_ref in ({})'.format(qry_str)

        competition_table = competition_table.union(convert_sql_result_to_set(qry, (lambda x: (x[0], (x[1], x[2])))))


def clear_competition_dictionary():
    clear_dictionary(competition_dictionary['table_structure'])


competition_dictionary = {
    'table_name': "Competition",
    'add_to_variable_table_method': add_to_competition_table,
    'clear_method': clear_competition_dictionary,
    'table_structure': {
        'comp_name': [],
        'country': [],
        'year': [],
        'fl_ref': [],
        'finished_backfill': []
    },
    'variable_table': competition_table
}


# Player
def add_to_player_table():
    global player_table

    new_refs = player_dictionary['table_structure']['fl_ref']

    if new_refs:
        refs = []
        for fl_ref in new_refs:
            refs.append("'{}'".format(fl_ref))
        qry_str = ", ".join(refs)

        qry = 'SELECT fl_ref, player_id FROM Player WHERE fl_ref in ({})'.format(qry_str)

        player_table = player_table.union(convert_sql_result_to_set(qry, (lambda x: (x[0], x[1]))))


def clear_player_dictionary():
    clear_dictionary(player_dictionary['table_structure'])


player_dictionary = {
    'table_name': "Player",
    'add_to_variable_table_method': add_to_player_table,
    'clear_method': clear_player_dictionary,
    'table_structure': {
        'name': [],
        'nationality': [],
        'dob': [],
        'height': [],
        'foot': [],
        'position': [],
        'fl_ref': []
    },
    'variable_table': player_table
}


# ClubSeason
def add_to_club_season_table():
    global club_season_table

    new_refs = club_season_dictionary['table_structure']['fl_ref']

    if new_refs:
        refs = []
        for fl_ref in new_refs:
            refs.append("'{}'".format(fl_ref))
        qry_str = ", ".join(refs)

        qry = 'SELECT fl_ref, club_id, comp_id, players_backfilled FROM ClubSeason WHERE fl_ref in ({})'.format(qry_str)

        club_season_table = club_season_table.union(
            convert_sql_result_to_set(qry, (lambda x: (x[0], (x[1], x[2], x[3])))))


def clear_club_season_dictionary():
    clear_dictionary(club_season_dictionary['table_structure'])


club_season_dictionary = {
    'table_name': "ClubSeason",
    'add_to_variable_table_method': add_to_club_season_table,
    'clear_method': clear_club_season_dictionary,
    'table_structure': {
        'club_id': [],
        'comp_id': [],
        'fl_ref': [],
        'final_place': [],
        'points': [],
        'games': [],
        'wins': [],
        'draws': [],
        'losses': [],
        'goals_scored': [],
        'goals_against': [],
        'players_backfilled': []
    },
    'variable_table': club_season_table
}


# Game
def add_to_game_table():
    global game_table

    new_refs = game_dictionary['table_structure']['fl_ref']

    if new_refs:
        refs = []
        for fl_ref in new_refs:
            refs.append("'{}'".format(fl_ref))
        qry_str = ", ".join(refs)

        qry = 'SELECT fl_ref, game_id FROM Game WHERE fl_ref in ({})'.format(qry_str)

        game_table = game_table.union(convert_sql_result_to_set(qry, (lambda x: (x[0], x[1]))))


def clear_game_dictionary():
    clear_dictionary(game_dictionary['table_structure'])


game_dictionary = {
    'table_name': "Game",
    'add_to_variable_table_method': add_to_game_table,
    'clear_method': clear_game_dictionary,
    'table_structure': {
        'comp_id': [],
        'stage': [],
        'fl_ref': [],

        'home_club_id': [],
        'home_goals': [],
        'home_shots': [],
        'home_shots_on_goal': [],
        'home_fouls': [],
        'home_corners': [],
        'home_offsides': [],
        'home_possession': [],
        'home_yellow_cards': [],
        'home_red_cards': [],

        'away_club_id': [],
        'away_goals': [],
        'away_shots': [],
        'away_shots_on_goal': [],
        'away_fouls': [],
        'away_corners': [],
        'away_offsides': [],
        'away_possession': [],
        'away_yellow_cards': [],
        'away_red_cards': []
    },
    'variable_table': game_table
}


##### Dataframe Helper Methods
def add_to_database(table):
    table_name = table['table_name']
    pandas.DataFrame(table['table_structure']).to_sql(table_name, con=engine, if_exists='append', index=False)
    table['add_to_variable_table_method']()
    table['clear_method']()


def add_club(fl_ref, club_name, stadium, country):
    table = club_dictionary['table_structure']
    table['fl_ref'].append(fl_ref)
    table['club_name'].append(club_name)
    table['stadium'].append(stadium)
    table['country'].append(country)

    print('Added club {} with stadium {} [{}] ({})'.format(club_name, stadium, country, fl_ref))


def add_competition(comp_name, country, year, fl_ref):
    table = competition_dictionary['table_structure']
    table['comp_name'].append(comp_name)
    table['country'].append(country)
    table['year'].append(year)
    table['fl_ref'].append(fl_ref)
    table['finished_backfill'].append(False)

    print('Added competition {} for {} [{}] ({})'.format(comp_name, year, country, fl_ref))


def add_player(name, nationality, dob, height, foot, position, fl_ref):
    table = player_dictionary['table_structure']
    table['name'].append(name)
    table['nationality'].append(nationality)
    table['dob'].append(dob)
    table['height'].append(height)
    table['foot'].append(foot)
    table['position'].append(position)
    table['fl_ref'].append(fl_ref)

    print(
    'Added player {} [{}], born {}. Position: {}, Height: {}, Foot: {} ({})'.format(name, nationality, dob, position,
                                                                                    height, foot, fl_ref))


def add_club_season(club_id, comp_id, fl_ref):
    table = club_season_dictionary['table_structure']
    table['club_id'].append(club_id)
    table['comp_id'].append(comp_id)
    table['fl_ref'].append(fl_ref)
    table['final_place'].append(-1)
    table['points'].append(-1)
    table['games'].append(-1)
    table['wins'].append(-1)
    table['draws'].append(-1)
    table['losses'].append(-1)
    table['goals_scored'].append(-1)
    table['goals_against'].append(-1)
    table['players_backfilled'].append(False)

    print('Added club season for ({}, {}) ({})'.format(club_id, comp_id, fl_ref))


def add_temporary_game_to_database(comp_id, stage, fl_ref, home_id, away_id):
    table = game_dictionary['table_structure']
    table['comp_id'].append(comp_id)
    table['stage'].append(stage)
    table['fl_ref'].append(fl_ref)

    table['home_club_id'].append(home_id)
    table['home_goals'].append(-1)
    table['home_shots'].append(-1)
    table['home_shots_on_goal'].append(-1)
    table['home_fouls'].append(-1)
    table['home_corners'].append(-1)
    table['home_offsides'].append(-1)
    table['home_possession'].append(-1)
    table['home_yellow_cards'].append(-1)
    table['home_red_cards'].append(-1)

    table['away_club_id'].append(away_id)
    table['away_goals'].append(-1)
    table['away_shots'].append(-1)
    table['away_shots_on_goal'].append(-1)
    table['away_fouls'].append(-1)
    table['away_corners'].append(-1)
    table['away_offsides'].append(-1)
    table['away_possession'].append(-1)
    table['away_yellow_cards'].append(-1)
    table['away_red_cards'].append(-1)

    print('Added game in {}: {} vs {} [{}] ({})'.format(comp_id, home_id, away_id, stage, fl_ref))


# Helper method
def get_club_href_from_season(club_season_href):
    return '/'.join(club_season_href.split('/')[0:5])


def get_club_from_season(season_href):
    global club_table

    return dict(club_table).get(get_club_href_from_season(season_href))


# Backfill methods
def backfill_competitions(driver):
    global competition_table

    try:
        driver.get(base_url + tournaments_page_suffix)
        html = driver.page_source
        code = BeautifulSoup(html, 'html5lib')

        main_table = code.find('div', id="maincontent").find('td', attrs={"class": "TDmain"}).find('table')
        all_comps = main_table.find_all('a')

        for comp in all_comps:
            comp_url = base_url + comp['href'][:-1]

            if comp_url == "https://www.football-lineups.com/supercup":
                print("Skipping supercups")
                continue

            if comp_url not in dict(competition_table):
                driver.get(comp_url)
                comp_html = driver.page_source
                comp_page = BeautifulSoup(comp_html, 'html5lib')
                comp_main = comp_page.find('div', id='maintitle').find('td', attrs={"class": "TDmain"}).find('td')
                comp_name = comp_main.find('font')
                if comp_name.find('a'):
                    comp_name = comp_name.find('a').get_text()
                else:
                    comp_name = comp_name.get_text()
                comp_country = comp_main.find('a').find('img')['title']

                comp_season_select = comp_main.find('select')

                if comp_season_select:
                    comp_seasons = comp_season_select.find_all('option')

                    for season in comp_seasons:
                        year = ''.join(ch for ch in season.get_text() if not ch.isalpha()).strip()
                        fl_href = 'https://www.football-lineups.com/tourn/' + season['value']

                        if fl_href not in dict(competition_table):
                            add_competition(comp_name, comp_country, year, fl_href)
                elif comp_url not in dict(competition_table):
                    add_competition(comp_name, comp_country, comp_url.split('_')[-1], comp_url)

                add_to_database(competition_dictionary)
            else:
                print(comp_url + " already in database.")
    except (TimeoutException, SessionNotCreatedException):
        print("error backfilling competitions")


def backfill_club(driver, club_href):
    global club_table, club_dictionary

    if club_href not in dict(club_table):
        driver.get(club_href)
        html = driver.page_source
        soup = BeautifulSoup(html, 'html5lib')

        club_header = soup.find('tr', id="trteamencab") \
            .find('td')

        info_box = club_header.find('h1')
        club_name = info_box.get_text().replace("\"", "").strip()
        country = info_box.find('img')['title'].strip()

        a_list = club_header.find_all('a')
        stadium = None
        if len(a_list) > 1:
            stadium = a_list[1].get_text().strip()
        else:
            stadium = "Unknown"

        add_club(club_href, club_name, stadium, country)

        add_to_database(club_dictionary)

    return dict(club_table).get(club_href)


def backfill_player(driver, player_href):
    if player_href not in dict(player_table):
        driver.get(player_href)
        html = driver.page_source
        code = BeautifulSoup(html, 'html5lib')

        player_main = code.find('div', id='maintitle').find('td', attrs={"class": "TDmain"}).find('td')
        info_table = player_main.find('table').find('td', attrs={"width": "220"}).find('table')

        name = str(player_main.find(text=True, recursive=False))
        nationality = str(player_main.find('h1').find('img')['title'])
        dob = None
        height = None
        foot = None
        position = None

        for tr in info_table.find_all('tr'):
            txt = tr.get_text()
            if "Born" in txt:
                dob_arr = txt.split(" ")[0].split(":")[1].strip().split("-")
                year = ("19" + dob_arr[2]) if dob_arr[2] > "19" else ("20" + dob_arr[2])
                month = month_dict.get(dob_arr[1])
                day = dob_arr[0]
                dob = "{}-{}-{}".format(year, month, day)
            elif "Height" in txt:
                height = txt.split(":")[1].strip()
            elif "Fav.foot" in txt:
                foot = txt.split(":")[1].strip()
            elif "Position" in txt:
                position = txt.split(":")[1].strip()

        add_player(name, nationality, dob, height, foot, position, player_href)
        add_to_database(player_dictionary)


def backfill_club_season(driver, club_season_href, comp_id):
    global club_season_table, club_season_dictionary

    club_href = get_club_href_from_season(club_season_href)
    # Make sure the club exists in the database
    club_id = backfill_club(driver, club_href)

    if club_season_href not in dict(club_season_table) \
            and club_season_href not in club_season_dictionary['table_structure']['fl_ref']:
        # Backfill the season with 0's for stats
        add_club_season(club_id, comp_id, club_season_href)
        # Assume that the DataFrame.to_sql method is called externally


def begin_player_backfill(driver):
    for (club_season_href, (_, _, players_backfilled)) in dict(club_season_table):
        if not players_backfilled:
            try:
                player_list = []
                driver.get(club_season_href + "/Players")
                html = driver.page_source
                code = BeautifulSoup(html, 'html5lib')

                main_table = code.find('div', id="maincontent").find('td', attrs={"class": "TDmain"}).find_all('table')[
                    1]
                entries = main_table.find_all('tr')
                for entry in entries:
                    actual_entry = entry.find('a', href=lambda x: x and x.startswith('/footballer/'))
                    if actual_entry:
                        player_href = (base_url + actual_entry['href'])[:-1]
                        player_list.append(player_href)

                for player_href in player_list:
                    backfill_player(driver, player_href)
            except (TimeoutException, SessionNotCreatedException):
                print("Error loading Players page for " + club_season_href)


def backfill_seasons(driver):
    global competition_table, club_season_dictionary, game_dictionary

    for (fl_ref, (id, is_finished)) in competition_table:
        try:
            print("{} {} [{}]".format(str(fl_ref), str(id), str(is_finished)))

            if not is_finished:
                # Make sure the clubs are backfilled
                # Use just the fixtures. We can infer the table after.
                driver.get(fl_ref + "/Fixture")
                html = driver.page_source
                code = BeautifulSoup(html, 'html5lib')

                fixture_table = code.find('div', id="maincontent") \
                    .find('td', attrs={"class": "TDmain"}) \
                    .find('table', attrs={"width": "690", "bgcolor": "#ffffff"})

                if fixture_table:
                    fixtures = fixture_table.find_all('tr', id=lambda x: x and x.startswith('trfil'))
                    for fixture in fixtures:
                        columns = fixture.find_all('td')

                        stage_col = columns[1].find('font')
                        stage = None
                        if stage_col:
                            stage = stage_col.get_text()
                        else:
                            stage = "League"

                        home_col = columns[2].find('a')
                        home_season_href = base_url + home_col['href']

                        game_col = columns[3].find('a')
                        game_href = base_url + game_col['href']

                        if game_href not in dict(game_table):
                            away_col = columns[4].find('a')
                            away_season_href = base_url + away_col['href']

                            backfill_club_season(driver, home_season_href, id)
                            backfill_club_season(driver, away_season_href, id)

                            home_id = get_club_from_season(home_season_href)
                            away_id = get_club_from_season(away_season_href)

                            add_temporary_game_to_database(id, stage, game_href, home_id, away_id)

                    if len(club_season_dictionary['table_structure']['fl_ref']):
                        add_to_database(club_season_dictionary)
                    if len(game_dictionary['table_structure']['fl_ref']):
                        add_to_database(game_dictionary)

                engine.execute("UPDATE Competition SET finished_backfill=True WHERE fl_ref='{}'".format(fl_ref))
        except (TimeoutException, SessionNotCreatedException):
            print("Error loading " + str(fl_ref))


def backfill_everything():
    driver = None
    try:
        driver = webdriver.Chrome("./chromedriver.exe", chrome_options=chrome_options)
        driver.set_page_load_timeout(10)

        backfill_competitions(driver)
        backfill_seasons(driver)
        begin_player_backfill(driver)
    except (TimeoutException, SessionNotCreatedException):
        print("Error loading " + str(fl_ref))
    finally:
        driver.quit()


backfill_everything()

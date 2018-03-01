#!/usr/bin/python3
# vim: tabstop=8 expandtab shiftwidth=4 softtabstop=4

import mysql.connector
import pandas
import sys
from bs4 import BeautifulSoup
from sqlalchemy import create_engine
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

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
competition_table = convert_sql_result_to_set("SELECT fl_ref, comp_id FROM Competition", (lambda x: (x[0], x[1])))

# Global Headless Driver
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("log-level=3")

# Global Football-Lineups Information
base_url = "https://www.football-lineups.com"
tournaments_page_suffix = "/tournaments/"

# DataFrame Dictionary Objects
def add_to_competition_table():
    global competition_table

    existing_refs = competition_dictionary['table_structure']['fl_ref']

    if existing_refs:
        refs = []
        for fl_ref in existing_refs:
            refs.append("'{}'".format(fl_ref))
        qry_str = ", ".join(refs)

        qry = 'SELECT fl_ref, comp_id FROM Competition WHERE fl_ref in ({})'.format(qry_str)

        competition_table = competition_table.union(convert_sql_result_to_set(qry, (lambda x: (x[0], x[1]))))

def clear_competition_dictionary():
    table = competition_dictionary['table_structure']
    table['comp_name'].clear()
    table['country'].clear()
    table['year'].clear()
    table['fl_ref'].clear()

competition_dictionary = {
    'table_name': "Competition",
    'add_to_variable_table_method': add_to_competition_table,
    'clear_method': clear_competition_dictionary,
    'table_structure': {
        'comp_name': [],
        'country': [],
        'year': [],
        'fl_ref': []
    },
    'variable_table': competition_table
}

# Dataframe Helper Methods
def add_to_database(table):
    table_name = table['table_name']
    table['add_to_variable_table_method']()
    pandas.DataFrame(table['table_structure']).to_sql(table_name, con=engine, if_exists='append', index=False)
    table['clear_method']()

def add_competition(comp_name, country, year, fl_ref):
    table = competition_dictionary['table_structure']
    table['comp_name'].append(comp_name)
    table['country'].append(country)
    table['year'].append(year)
    table['fl_ref'].append(fl_ref)

    print('Added {} for {} [{}] ({})'.format(comp_name, year, country, fl_ref))

def backfill_competitions():
    try:
        driver = webdriver.Chrome("./chromedriver.exe", chrome_options=chrome_options)
        driver.get(base_url + tournaments_page_suffix)
        html = driver.page_source
        code = BeautifulSoup(html, 'html5lib')

        main_table = code.find('div', id="maincontent").find('td', attrs={"class": "TDmain"}).find('table')
        all_comps = main_table.find_all('a')

        for comp in all_comps:
            comp_url = base_url + comp['href'][:-1]

            if comp_url not in dict(competition_table):
                driver.get(comp_url)
                comp_html = driver.page_source
                comp_page = BeautifulSoup(comp_html, 'html5lib')

                comp_main = comp_page.find('div', id='maintitle').find('td', attrs={"class": "TDmain"}).find('td')

                comp_name = comp_main.find('font').find('a').get_text()
                comp_country = comp_main.find('a').find('img')['title']

                comp_season_select = comp_main.find('select')

                if comp_season_select:
                    comp_seasons = comp_season_select.find_all('option')

                    for season in comp_seasons:
                        year = season.get_text()
                    fl_href = 'https://www.football-lineups.com/tourn/' + season['value']

                    if fl_href not in dict(competition_table):
                        add_competition(comp_name, comp_country, year, fl_href)
                else:
                    add_competition(comp_name, comp_country, comp_url.split('_')[-1], comp_url)

                add_to_database(competition_dictionary)
            else:
                print(comp_url + " already in database")
    finally:
        driver.quit()

backfill_competitions()
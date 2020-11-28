import pandas as pd
import json
import argparse

df = pd.read_csv('../data/all_slim_athlete_events.csv')
# drop non-medalists
#df = df[df['Medal']!='N']

#split into two
#iterate over events

selectionDict = {"Winter":{}, "Summer":{}}
season_ls = ["Winter", "Summer"]
for sl in season_ls:
    season_df = df[df['Season']==sl]
    season_sport_ls = list(set(season_df['Sport']))
    selectionDict[sl] = dict(zip(season_sport_ls, [{}]*len(season_sport_ls)))
    for ssl in season_sport_ls:
        sport_df = season_df[season_df['Sport'] == ssl]
        now_event_ls = list(set(sport_df['Event']))
        selectionDict[sl][ssl] = dict(zip(now_event_ls,[{}]*len(now_event_ls)))
        for nel in now_event_ls:
            event_df = sport_df[sport_df['Event']==nel]
            year_ls = sorted(list(set(event_df['Year'])))
            selectionDict[sl][ssl][nel] = year_ls

with open('../data/year_range_list.json', 'w') as out_f:
    json.dump(selectionDict, out_f)
            

            

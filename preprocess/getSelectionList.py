import pandas as pd
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-dt', '--data_type', help='5k or all')
args = parser.parse_args()
data_type = args.data_type

print("Preparing %s datast..."%data_type)
df = pd.read_csv('../data/%s_slim_athlete_events.csv'%data_type)
# drop non-medalists
df = df[df['Medal']!='N']

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
        selectionDict[sl][ssl] = now_event_ls

with open('../data/%s_selection_list.json'%data_type, 'w') as out_f:
    json.dump(selectionDict, out_f)

print(selectionDict['Winter'])
print('-----')
print(selectionDict['Summer'])
            

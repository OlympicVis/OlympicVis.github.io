import pandas as pd
import json


df = pd.read_csv('../data/all_slim_athlete_events.csv')

selectionDict = {"Winter":{}, "Summer":{}}
season_ls = ["Winter", "Summer"]
income_text_ls = ["Low-income countries", "Low-middle income countries", "Upper-middle income countries", "High-income countries"]
income_ls = ['L', 'LM', 'UM', 'H']
for sl in season_ls:
    season_df = df[df['Season']==sl]
    season_sport_ls = list(set(season_df['Sport']))
    selectionDict[sl] = dict(zip(season_sport_ls, [{}]*len(season_sport_ls)))
    for ssl in season_sport_ls:
        sport_df = season_df[season_df['Sport'] == ssl]
        sex_ls = list(set(sport_df['Sex']))
        selectionDict[sl][ssl] = dict(zip(sex_ls, [{}]*len(sex_ls)))
        for sels in sex_ls:
            selectionDict[sl][ssl][sels] = income_ls

with open('../data/all_prediction_selection_list.json', 'w') as out_f:
    json.dump(selectionDict, out_f)

print(selectionDict['Winter'])
print('-----')
print(selectionDict['Summer'])
            

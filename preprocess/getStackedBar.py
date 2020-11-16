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

stackedBarDict = {"Winter":{}, "Summer":{}}
season_ls = ["Winter", "Summer"]
for sl in season_ls:
    season_df = df[df['Season']==sl]
    season_sport_ls = list(set(season_df['Sport']))
    stackedBarDict[sl] = dict(zip(season_sport_ls, [{}]*len(season_sport_ls)))
    for ssl in season_sport_ls:
        sport_df = season_df[season_df['Sport'] == ssl]
        now_event_ls = list(set(sport_df['Event']))
        stackedBarDict[sl][ssl] = dict(zip(now_event_ls, [{}]*len(now_event_ls)))
        for nel in now_event_ls:
            event_df = sport_df[sport_df['Event'] == nel]
            now_age_ls = list(set(event_df['Age']))
            age_dict_ls = []
            for nal in now_age_ls:
                age_df = event_df[event_df['Age'] == nal]
                gold_cnt = len(age_df[age_df['Medal']=='Gold'].index)
                silver_cnt = len(age_df[age_df['Medal']=='Silver'].index)
                bronze_cnt = len(age_df[age_df['Medal']=='Bronze'].index)
                tmp_age_dict = {
                    "Age": nal, "Gold": gold_cnt, "Silver": silver_cnt, "Bronze": bronze_cnt
                }
                age_dict_ls.append(tmp_age_dict)
            stackedBarDict[sl][ssl][nel] = age_dict_ls
with open('../data/%s_medal_stacked_bar.json'%data_type, 'w') as out_f:
    json.dump(stackedBarDict, out_f)

#print(stackedBarDict['Winter'])
#print('-----')
#print(stackedBarDict['Summer'])
            

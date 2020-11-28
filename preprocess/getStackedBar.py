import pandas as pd
import json

df = pd.read_csv('../data/all_slim_athlete_events.csv')
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
                year_ls = list(set(age_df['Year']))
                for yl in year_ls:
                    year_df = age_df[age_df['Year'] == yl]
                    gold_cnt = len(year_df[year_df['Medal']=='Gold'].index)
                    silver_cnt = len(year_df[year_df['Medal']=='Silver'].index)
                    bronze_cnt = len(year_df[year_df['Medal']=='Bronze'].index)
                    tmp_age_dict = {
                    "Year": yl, "Age": nal, "Gold": gold_cnt, "Silver": silver_cnt, "Bronze": bronze_cnt
                }
                    age_dict_ls.append(tmp_age_dict)
            stackedBarDict[sl][ssl][nel] = age_dict_ls
print(stackedBarDict['Summer']['Basketball']["Men's Basketball"])
with open('../data/all_medal_stacked_bar_by_year.json', 'w') as out_f:
    json.dump(stackedBarDict, out_f)

#print(stackedBarDict['Winter'])
#print('-----')
#print(stackedBarDict['Summer'])
            

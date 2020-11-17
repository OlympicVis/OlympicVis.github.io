import pandas as pd
import json
import argparse
from statistics import median

parser = argparse.ArgumentParser()
parser.add_argument('-dt', '--data_type', help='5k or all')
args = parser.parse_args()
data_type = args.data_type

print("Preparing %s dataset..."%data_type)
df = pd.read_csv('../data/%s_slim_athlete_events.csv'%data_type)
#print(len(df.index))
#print(len(df[df['Age']==0].index))
#split into two
#iterate over events
errorBarDict = {"Winter":{}, "Summer":{}}
season_ls = ["Winter", "Summer"]
for sl in season_ls:
    season_df = df[df['Season']==sl]
    season_sport_ls = list(set(season_df['Sport']))
    errorBarDict[sl] = dict(zip(season_sport_ls, [{}]*len(season_sport_ls)))
    for ssl in season_sport_ls:
        sport_df = season_df[season_df['Sport'] == ssl]
        now_event_ls = list(set(sport_df['Event']))
        errorBarDict[sl][ssl] = dict(zip(now_event_ls, [{}]*len(now_event_ls)))
        for nel in now_event_ls:
            event_df = sport_df[sport_df['Event'] == nel]
            now_year_ls = list(set(event_df['Year']))
            year_dict_ls = []
            for nyl in now_year_ls:
                gold_age = []
                silver_age = []
                bronze_age = []
                none_age = []
                age_df = event_df[event_df['Year'] == nyl]
                # iterate the age_df
                tmp_year_dict = {}
                for index, row in age_df.iterrows():
                    if row['Medal'] == 'N':
                        none_age.append(row['Age'])
                    elif row['Medal'] == 'Gold':
                        gold_age.append(row['Age'])
                    elif row['Medal'] == 'Silver':
                        silver_age.append(row['Age'])
                    elif row['Medal'] == 'Bronze':
                        bronze_age.append(row['Age'])
                    else:
                        raise NotImplementedError('Only Gold, Silver, Bronze and N are supported in Medal types')
                # for empty arrays
                if (len(none_age)==0):
                    none_age = [0]
                if (len(gold_age) == 0):
                    gold_age = [0]
                if (len(silver_age) == 0):
                    silver_age = [0]
                if (len(bronze_age) == 0):
                    bronze_age = [0]
                tmp_year_dict = [{"Year": nyl, "Medal": "Gold", "minAge": min(gold_age) , "maxAge": max(gold_age), "medianAge": median(gold_age)},
                    {"Year": nyl, "Medal": "Silver", "minAge": min(silver_age) , "maxAge": max(silver_age), "medianAge": median(silver_age)},
                    {"Year": nyl, "Medal": "Bronze", "minAge": min(bronze_age), "maxAge": max(bronze_age), "medianAge": median(bronze_age)},
                    {"Year": nyl, "Medal": "None", "minAge": min(none_age) , "maxAge": max(none_age), "medianAge": median(none_age)}
                ]
                year_dict_ls.extend(tmp_year_dict)
            errorBarDict[sl][ssl][nel] = year_dict_ls

#print(errorBarDict['Summer']['Basketball']["Women's Basketball"])

with open('../data/%s_age_error_bar.json'%data_type, 'w') as out_f:
    json.dump(errorBarDict, out_f)

#print(errorBarDict['Winter'])
#print('-----')
#print(errorBarDict['Summer'])
            

import pandas as pd
import numpy as np
import random

all_df = pd.read_csv('../data/all_slim_athlete_events.csv')
all_df = all_df.sample(frac=1).reset_index(drop=True)

for index, row in all_df.iterrows():
    if '-' in row['Team']:
        all_df.drop(index, inplace=True)

year_ls = list(set(all_df['Year']))
sports_ls = list(set(all_df['Sport']))
#sport index
sport_df = pd.DataFrame(columns = list(all_df.columns))
#save all sport
for sps in sports_ls:
    sport_df.loc[len(sport_df.index)] = all_df[all_df['Sport']==sps].iloc[0] 


#save all countries
country_ls = list(set(all_df['Team']))
#country index
country_df = pd.DataFrame(columns = list(all_df.columns))
for cl in country_ls:
    country_df.loc[len(country_df.index)] = all_df[all_df['Team']==cl].iloc[0]       

cnt=0
all_len = len(all_df.index)
for index, row in all_df.iterrows():
        cnt+=1
        if cnt%1000==0:
            print("sampling process %0.2f%%"%(100.0*cnt/all_len))
        now = np.random.uniform()
        if now > 0.05:
            all_df.drop(index, inplace=True)

all_df.reset_index(drop=True, inplace=True)

#repair if sports or year or country are missing
for sps in sports_ls:
    if len(all_df[all_df['Sport']==sps])==0:
        tmp = sport_df[sport_df['Sport'] == sps]
        all_df_len = len(all_df.index)
        all_df.loc[all_df_len] = tmp.loc[list(tmp.index)[0]]


for cl in country_ls:
    if len(all_df[all_df['Team']==cl])==0:
        tmp = country_df[country_df['Team'] == cl]
        all_df_len = len(all_df.index)
        all_df.loc[all_df_len] = tmp.loc[list(tmp.index)[0]]


assert(len(set(all_df['Sport'])) == len(sports_ls))
assert(len(set(all_df['Team'])) == len(country_ls))
#optimistic assumption about year
print(len(year_ls))
print(len(set(all_df['Year'])))

all_df.to_csv('../data/boxplot_slim_athlete_events.csv', index=None)




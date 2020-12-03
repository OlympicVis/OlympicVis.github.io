import pandas as pd

boxdf = pd.read_csv('../data/boxplot_slim_athlete_events.csv')

nocdf = pd.read_csv('../data/noc_regions.csv')

nocdict = dict(zip(nocdf['NOC'], nocdf['region']))

newTeam = []
cnt = 1
for index, row in boxdf.iterrows():
    if row['NOC'] in nocdict.keys():
        newTeam.append(nocdict[row['NOC']])
    else:
        newTeam.append('NA')
        #row['Team'] = 'NA'
        cnt+=1
boxdf['Team'] = newTeam
#turned out only 20 NAs
print('%d NAs'%cnt)


#boxdf['Team'] = [(nocdict[item] if (item in nocdict.keys()) else 'NA') for item in boxdf['Team']]

boxdf.to_csv('../data/new_boxplot_slim_athlete_events.csv', index=None)
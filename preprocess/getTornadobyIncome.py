import pandas as pd
income_df = pd.read_csv('../data/processed_income_data.csv')
all_df = pd.read_csv('../data/all_slim_athlete_events.csv')
all_df = all_df[all_df['Year']>1987]
#all athletes
sele_df = all_df[['Year', 'Team', 'NOC', 'Age', 'Sex']]
#all medalists
#all_df = all_df[all_df['Medal'] != 'N']
#sele_df = all_df[['Year', 'Team', 'NOC', 'Age', 'Sex']]


#print(sele_df)
#income dict
#{"Year": [{"countryName": "L"}]}

year_ls = list(set(income_df['Year']))
#only keep years could be divided by 2
year_ls = [item for item in year_ls if item%2==0]

year_code_dict = {}
code_ls = list(set(income_df['Code']))
for yl in year_ls:
    year_code_dict[yl] = {}
    for cl in code_ls:
        tmp_dict = {}
        #print(income_df[(income_df['Year']==yl) & (income_df['Country']==cl)]['Income'])
        tmp_dict[cl] = income_df[(income_df['Year']==yl) & (income_df['Code']==cl)]['Income'].tolist()[0]
        year_code_dict[yl][cl] = tmp_dict[cl]

year_country_dict = {}
country_ls = list(set(income_df['Country']))
for yl in year_ls:
    year_country_dict[yl] = {}
    for cl in country_ls:
        tmp_dict = {}
        #print(income_df[(income_df['Year']==yl) & (income_df['Country']==cl)]['Income'])
        tmp_dict[cl] = income_df[(income_df['Year']==yl) & (income_df['Country']==cl)]['Income'].tolist()[0]
        year_country_dict[yl][cl] = tmp_dict[cl]


#print(year_dict[2010]['CHN'])
#print(sele_df.columns)
def getIncome(row): 
    defaultIncome = 'NA'
    #preprocess row, in case the team called 'Germany-1'
    team = (row.Team).split('-')[0]
    if row.NOC in year_code_dict[row.Year].keys():
        return year_code_dict[row.Year][row.NOC]
    elif team in year_country_dict[row.Year].keys():
        return year_country_dict[row.Year][team]
    else:
        #print(row)
        return defaultIncome

sele_df['Income'] = sele_df.apply(lambda row: getIncome(row), axis=1)
# drop team and NOC and Sports
sele_df = sele_df.drop(['Team', 'NOC'], axis=1)
cnt_df = sele_df.groupby(sele_df.columns.tolist()).size().reset_index().\
    rename(columns={0:'Records'})

cnt_df = cnt_df[cnt_df['Income'] != 'NA']
cnt_df.to_csv('../data/all_athletes_tornado_by_income.csv', index=None)

#cnt_df.to_csv('../data/all_medalists_tornado_by_income.csv', index=None)
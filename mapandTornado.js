d3.queue()
    .defer(d3.csv, 'data/all_medalists_tornado_by_income.csv')
    .defer(d3.csv, 'data/all_athletes_tornado_by_income.csv')
    .defer(d3.csv, 'data/all_medalists_tornado_by_country.csv')
    .defer(d3.csv, 'data/all_athletes_tornado_by_country.csv')
    .defer(d3.csv, 'data/processed_income_data.csv')
    .defer(d3.json, 'data/countries.json')
    .await(function(err, medalIncomeData, allIncomeData, medalCountryData, allCountryData, incomeData, json) {
        if (err) {
            console.error('Something went wrong: ' + err);
        }
        else {
            //dropdown menue
            selectBtnYear = document.querySelector('#Year');
            selectBtnMedal = document.querySelector('#Medal');
            //map
            var getData = d3.nest()
					.key(function(d){return d.Year;})
                    .entries(incomeData);
            //default year 1992
            updateMap(json.features, getData, medalCountryData, allCountryData, 1992, 'all-athletes');
            //update chart
            selectBtnYear.addEventListener('change', function() {
                d3.select("#mapsvg").remove();
                d3.selectAll(".legend").remove();
                updateMap(json.features, getData, medalCountryData, allCountryData, selectBtnYear.value, selectBtnMedal.value);
        });

            //tornado plots
            medalIncomeData.forEach(d => {
                d.Age = + d.Age;
                d.Income = d.Income;
                d.Medal = d.Medal;
                d.Records = +d.Records;
                d.Sex = d.Sex;
                d.Year = +d.Year;
                if (d.Sex == 'F') {
                    d.Records = -1 * d.Records;
                }
            });

            allIncomeData.forEach(d => {
                d.Age = + d.Age;
                d.Income = d.Income;
                d.Medal = d.Medal;
                d.Records = +d.Records;
                d.Sex = d.Sex;
                d.Year = +d.Year;
                if (d.Sex == 'F') {
                    d.Records = -1 * d.Records;
                }
            });

            medalCountryData.forEach(d => {
                d.Age = + d.Age;
                d.Income = d.Income;
                d.Medal = d.Medal;
                d.Records = +d.Records;
                d.Sex = d.Sex;
                d.Year = +d.Year;
                d.Team = d.Team;
                if (d.Sex == 'F') {
                    d.Records = -1 * d.Records;
                }
            });

            allCountryData.forEach(d => {
                d.Age = + d.Age;
                d.Income = d.Income;
                d.Medal = d.Medal;
                d.Records = +d.Records;
                d.Sex = d.Sex;
                d.Year = +d.Year;
                d.Team = d.Team;
                if (d.Sex == 'F') {
                    d.Records = -1 * d.Records;
                }
            });

            //default, 1992, all athletes
            plotTornado(allIncomeData, 1992, 'all-athletes');
        
            //update chart based on user selection
            selectBtnYear.addEventListener('change', function() {
                    d3.selectAll(".tornado-svg").remove();
                    if (selectBtnMedal.value === 'all-athletes') {
                        plotTornado(allIncomeData, selectBtnYear.value, selectBtnMedal.value);
                    }
                    else {
                        plotTornado(medalIncomeData, selectBtnYear.value, selectBtnMedal.value);
                    }
            });
            
            selectBtnMedal.addEventListener('change', function() {
                d3.selectAll(".tornado-svg").remove();
                if (selectBtnMedal.value === 'all-athletes') {
                    plotTornado(allIncomeData, selectBtnYear.value, selectBtnMedal.value);
                }
                else {
                    plotTornado(medalIncomeData, selectBtnYear.value, selectBtnMedal.value);
                }
                
            });
            //suppose the selected country is Australia
        }
    });
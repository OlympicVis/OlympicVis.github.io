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
            
            //map
            var getData = d3.nest()
					.key(function(d){return d.Year;})
                    .entries(incomeData);

            //default year 1992
            mapSelectYear = 1988;
            mapSelectAthlete = 'all-athletes';
            console.log(document.querySelector("#athleteType").athleteTypeRadio);
            mapSelectAthleteBtn = document.querySelector("#athleteType").athleteTypeRadio;
            //take the radio button value
            for (var i = 0; i < mapSelectAthleteBtn.length; i++) {
                mapSelectAthleteBtn[i].addEventListener('change', function() {
                    mapSelectAthlete = this.value;
                    if (mapSelectAthlete === 'all-athletes') {
                        console.log('all athlete');
                        plotTornado(allIncomeData, mapSelectYear, mapSelectAthlete);
                    }
                    else {
                        plotTornado(medalIncomeData, mapSelectYear, mapSelectAthlete);
                    }
                });
            }

            //create the year slider
            Array.range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
            var mapYearData = Array.range(1988, 2018);
            var mapSlider = d3.sliderHorizontal()
            .domain(d3.extent(mapYearData))
            .width(700)
            .tickFormat(d3.format('d'))
            .ticks(12)
            .step(4)
            .default(2000)
            .on('onchange', val => {
                //assign to global var
                mapSelectYear = val;
                updateMap(json.features, getData, medalCountryData, allCountryData, mapSelectYear, mapSelectAthlete);
                if (mapSelectAthlete === 'all-athletes') {
                    console.log('all athlete');
                    plotTornado(allIncomeData, mapSelectYear, mapSelectAthlete);
                }
                else {
                    plotTornado(medalIncomeData, mapSelectYear, mapSelectAthlete);
                }
            });;
            var mapsliderg = d3.select("#mapYearSlider").append("svg")
            .attr("width", 800)
            .attr("height", 100)
            .append("g")
            .attr("transform", "translate(30,30)");
            mapsliderg.call(mapSlider);

             //default, 1992, all athletes
            updateMap(json.features, getData, medalCountryData, allCountryData, mapSelectYear, 'all-athletes');
            plotTornado(allIncomeData, mapSelectYear, 'all-athletes');
        
            
        }
    });
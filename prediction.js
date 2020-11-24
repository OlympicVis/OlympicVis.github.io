//create year slider
Array.range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
var yearData = Array.range(12, 60);

var slider = d3.sliderHorizontal()
  .domain(d3.extent(yearData))
  .width(900)
  .tickFormat(d3.format('d'))
  .ticks(15)
  .step(1)
  .default(20);

var sliderg = d3.select("#age-slider").append("svg")
  .attr("width", 1200)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(30,30)");

sliderg.call(slider);

window.onload = function() {
  d3.queue()  
    .defer(d3.json, 'data/all_selection_list.json')
    .defer(d3.json, 'data/athlete_medal_probabilities.json')
    .await(function(error, selectorData, probData) {
      probData = JSON.parse(probData);
      var selectSeason = document.querySelector('#Season2')
      var selectSport = document.querySelector('#Sport2');
      var selectGender = document.querySelector('#Gender');
      var selectIncome = document.querySelector('#Income');
      //var selectAge = document
      
        // populate drop-downs
        setOptions(selectSeason, Object.keys(selectorData));
        setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
        
        function setOptions(dropDown, options) {
          //sort alphabetically
          options.sort();
          dropDown.innerHTML = '';
    
          options.forEach(function(value) {
                //change summer default to a sport with more medals
                if (value == 'Basketball') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else if (value == 'Summer') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else {
                  dropDown.innerHTML += '<option name="' + value + '">' + value + '</option>';
                }
          });

        }
        // Create dummy data
        var data = {'Gold': 0.05, 'Silver': 0.15, 'Bronze':0.3, 'None':0.5};
        updatePie(data);

        selectSeason.addEventListener('change', function() {
          setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
          pieData = probData[selectSeason.value][selectSport.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePie(pieData);
        });

        selectSport.addEventListener('change', function() {
          pieData = probData[selectSeason.value][selectSport.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePie(pieData);
          
        });

        selectGender.addEventListener('change', function() {
          pieData = probData[selectSeason.value][selectSport.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePie(pieData);
        });

        //sliderAge

    }
)};


function updatePie(data) {
  var width = 450
    height = 450
    margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
var radius = Math.min(width, height) / 2 - margin

// append the svg object to the div called 'my_dataviz'
var svg = d3.select("#pie-chart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// set the color scale
var color = d3.scaleOrdinal()
  .domain(data)
  .range(['#FFD700', '#DCDCDC', '#ED9B4D', '#000000'])

// Compute the position of each group on the pie:
var pie = d3.pie()
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
svg
  .selectAll('whatever')
  .data(data_ready)
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(radius)
  )
  .attr('fill', function(d){ return(color(d.data.key)) })
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)

}
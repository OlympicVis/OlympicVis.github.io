window.onload = function() {
    d3.queue()  
      .defer(d3.json, 'data/all_selection_list.json')
      .defer(d3.json, 'data/all_age_error_bar.json')
      .await(function(error, selectorData, ageData) {
        if (error) {
          console.error('Something went wrong: ' + error);
      }
        else {
          //selectSeason = $('#Season'),
          selectSeason = document.querySelector('#Season')
          selectSport = document.querySelector('#Sport');
          selectEvent = document.querySelector('#Event');
        
          // populate drop-downs
          setOptions(selectSeason, Object.keys(selectorData));
          setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
          setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
          
          function setOptions(dropDown, options) {
            //sort alphabetically
            options.sort();
            //console.log(options);
            // clear out any existing values
            dropDown.innerHTML = '';
            // insert the new options into the drop-down
            // select the first one by default
            //var i = 0;
            options.forEach(function(value) {
                  //change summer default to a sport with more medals
                  if (value == 'Summer') {
                    dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                  }
                  else if (value == 'Basketball') {
                    dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                  }
                  else if (value == 'Men\'s Basketball') {
                    dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                  }
                  else {
                    dropDown.innerHTML += '<option name="' + value + '">' + value + '</option>';
                  }
              //}
              //i++;
            });

          }


          ageErrorBar(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
          
          selectSeason.addEventListener('change', function() {
            setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            ageErrorBar(ageData[selectSeason.value][selectSport.value][selectEvent.value]);

          });

          selectSport.addEventListener('change', function() {
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            ageErrorBar(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
          })

          selectEvent.addEventListener('change', function() {
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
            //console.log(data[selectSeason.value][selectSport.value][selectEvent.value]);
            ageErrorBar(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
          })

        }
    })
  };




function ageErrorBar(data) {
    //e.g. [
		//{"Year": 1996, "Medal": Gold, "minAge":17, "maxAge":31, "medianAge":21}, 
    //{"Year": 2000, "Medal": Silver, "minAge":17, "maxAge":31, "medianAge":21}] 
    
    // clean previous drawing
    d3.select("svg").remove();
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#ageErrorBar")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    //find x and y axis domain
    start_year = 2020
    end_year = 0
    maxAge = 0
    minAge = 1000
    var parseDate = d3.timeParse("%Y");
    data.forEach((entry) => {

      if (entry["maxAge"] > maxAge) {
        maxAge = entry["maxAge"]
      }
      if (entry["minAge"] < minAge) {
        minAge = entry["minAge"]
      }
      if (entry["Year"] < start_year) {
        start_year = entry["Year"]
      }
      if (entry["Year"] > end_year) {
        end_year = entry["Year"]
      }
      //parse year
      entry["Year"] = parseDate(entry["Year"]);
    });

    //var x = d3.scaleLinear()
    //      .range([0, width])
    //      .domain([start_year-1, end_year+1]);
    var x = d3.scaleTime()
          .range([0, width])
          .domain([parseDate(start_year-1), parseDate(end_year+1)]);
    //console.log(x);
    
    svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
          .range([ height, 0 ])
          .domain([Math.max.apply(null, [10,minAge])-1, maxAge+1]);
    //yAxisTicks = y.ticks()
    //  .filter(tick => Number.isInteger(tick));
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format('d')));

    //check whether the mapping preserve the order
    medalTypes = ['Gold', 'Silver', 'Bronze']
    var color = d3.scaleOrdinal()
      .domain(medalTypes)
      //medal colors
      .range(['#FFD700', '#DCDCDC', '#ED9B4D']);

    //avoid collision
    //var medalPos = {'Gold': -1, 'Silver': -0.4, 'Bronze':0.3, 'None':1};
    //console.log(data);

    nonData = data.filter((entry) => entry['Medal']==='None');
    //filter out zeros
    //goodData = data.filter((entry) => (entry['minAge']!==0 && entry['maxAge']!==0));
    var lines = svg.selectAll('line.error')
      .data(nonData);

    //console.log(goodData);
  
    lines.enter()
      .append('line')
      .attr('class', 'error')
      .attr('stroke-width', 1)
    .merge(lines)
      .attr('stroke', 'black')
      .attr('x1', function(d) { return x(d.Year); })
      .attr('x2', function(d) { return x(d.Year); })
      .attr('y1', function(d) { return y(d.maxAge); })
      .attr('y2', function(d) { return y(d.minAge); });
    

    //only show medal data
    medalData = data.filter((entry) => entry['Medal']!=='None');
    var points = svg.selectAll('circle.point')
      .data(medalData);
  
    points.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('r', 6)
    .merge( points )
        .attr('fill', function(d) {return color(d.Medal)})
        .attr('cx', function(d) { //console.log(d.Year+medalPos[d.Medal]); 
          return x(d.Year); })
        .attr('cy', function(d) { return y(d.medianAge); })
  
}

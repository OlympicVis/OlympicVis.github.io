window.onload = function() {
    d3.queue()  
      .defer(d3.json, 'data/all_selection_list.json')
      .defer(d3.json, 'data/all_medal_stacked_bar.json')
      .defer(d3.json, 'data/all_age_error_bar.json')
      .await(function(error, selectorData, medalData, ageData) {
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

          //console.log(medalData);
          //console.log(ageData);

          ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
          stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
          
          selectSeason.addEventListener('change', function() {
            setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);

          });

          selectSport.addEventListener('change', function() {
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
          })

          selectEvent.addEventListener('change', function() {
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
            //console.log(data[selectSeason.value][selectSport.value][selectEvent.value]);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value]);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
          })

        }
    })
  };



function ageDotLine(data) {
    d3.select("#ageDotLinesvg").remove();
    console.log(data);
    //e.g. [
		//{"Year": 1996, "Medal": Gold, "minAge":17, "maxAge":31, "medianAge":21}, 
    //{"Year": 2000, "Medal": Silver, "minAge":17, "maxAge":31, "medianAge":21}] 
    
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#ageDotLine")
      .append("svg")
      .attr("id", "ageDotLinesvg")
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



function stackedBar(data) {
  //console.log(data);
  //d3.select("#stackedBar").remove();
  d3.select("#stackedBarsvg").remove();
  //e.g. [{Age: 24, Gold: 1, Silver: 0, Bronze: 0}, {Age: 25, Gold: 1, Silver: 0, Bronze: 0}]
  age_ls = [];
  medal_cnt_ls = [];
  data.forEach((entry) => {
    age_ls.push(entry['Age']);
    tmp_sum = entry['Gold'] + entry['Silver'] + entry['Bronze'];
    medal_cnt_ls.push(tmp_sum);
  });
  //sort age
  age_ls.sort((a, b) => a - b);

  //console.log(age_ls);
  //find y range
  maxMedal = d3.max(medal_cnt_ls);
  
  // get all ages
  var groups = age_ls;
  var subgroups = ['Gold', 'Silver', 'Bronze'];

  var margin = {top: 10, right: 30, bottom: 20, left: 50},
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

  var svg = d3.select("#stackedBar")
    .append("svg")
    .attr('id', 'stackedBarsvg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  //axis
  var x = d3.scaleBand()
        .range([0, width])
        .padding([0.2])
        .domain(groups);

  svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));
  
  var y = d3.scaleLinear()
        .range([ height, 0 ])
        .domain([0, maxMedal+1]);
  
  yAxisTicks = y.ticks()
    .filter(tick => Number.isInteger(tick));

  svg.append("g")
    .call(d3.axisLeft(y).tickValues(yAxisTicks).tickFormat(d3.format('d')));

  //check whether the mapping preserve the order
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    //medal colors
    .range(['#FFD700', '#DCDCDC', '#ED9B4D']);
  
  //var stackedData = d3.stack()
   // .keys(subgroups)(data);
   //stack the data? --> stack per subgroup
   var stackedData = d3.stack()
   .keys(subgroups)
   (data)

  //console.log(data);
  //console.log("the stacked data");
  //console.log(stackedData);
  
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { //console.log(d.data.Age); 
          return x(d.data.Age); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
}

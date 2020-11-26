//console.log('in aux for box plots');
window.onload = function() {
    d3.queue()  
      .defer(d3.json, 'data/all_selection_list.json')
      .defer(d3.json, 'data/all_medal_stacked_bar.json')
      .defer(d3.json, 'data/all_age_error_bar.json')
      .defer(d3.json, 'data/year_range_list.json')
      .await(function(error, selectorData, medalData, ageData, yearData) {
        if (error) {
          console.error('Something went wrong: ' + error);
      }
        else {
          //console.log(ageData);
          //console.log(selectorData);
          //selectSeason = $('#Season'),
          var selectSeason = document.querySelector('#Season')
          var selectSport = document.querySelector('#Sport');
          var selectEvent = document.querySelector('#Event');
        
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

          
          //default
          var parseDate =  d3.timeParse("%Y");
          [start_year, end_year] = d3.extent(yearData[selectSeason.value][selectSport.value][selectEvent.value]); 
          start_year = parseDate(start_year);
          end_year = parseDate(end_year);
          ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value], start_year, end_year);
          stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
          
          selectSeason.addEventListener('change', function() {
            setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value], start_year, end_year);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);

          });

          selectSport.addEventListener('change', function() {
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value], start_year, end_year);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
          })

          selectEvent.addEventListener('change', function() {
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
            //console.log(data[selectSeason.value][selectSport.value][selectEvent.value]);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value], start_year, end_year);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
          });

          //year slider
          var smargin = 20,
          swidth = 1200 - smargin * 2,
          sheight = 40;
        
          // v3 = var x = d3.scale.linear()
          var sx = d3.scaleTime()
              .domain([start_year,end_year])
              .range([0, swidth]);
      
          /*
          var brush = d3.svg.brush()
            .x(x)
            .extent([20, 50]);
          */
          var brush = d3.brushX()
              .extent([[0,0], [swidth,sheight]])
              .on("brush", brushed);
      
          var svg = d3.select("#year-slider").append("svg")
              .attr("width", swidth + smargin * 2)
              .attr("height", sheight + smargin)
            .append("g")
              .attr("transform", "translate(" + smargin + "," + smargin + ")")
              .call(d3.axisBottom()
                  .scale(sx)
                  .ticks(Math.floor((end_year.getFullYear()-start_year.getFullYear())/2)));
      
          var brushg = svg.append("g")
              .attr("class", "brush")
              .call(brush)
          
          /* 
            Height of the brush's rect is now 
              generated by brush.extent():*/
          brushg.selectAll("rect")
              .attr("height", sheight);
          
          function brushed() {
            var range = d3.brushSelection(this)
                .map(sx.invert);
            ageDotLine(ageData[selectSeason.value][selectSport.value][selectEvent.value], range[0], range[1]);
        }
        brush.move(brushg, [start_year, end_year].map(sx));
        //console.log(start_year, end_year);



        }
})
};


function ageDotLine(data, start_year, end_year) {
    d3.select("#ageDotLinesvg").remove();
    d3.selectAll(".ageDotToolTip").remove();
    //console.log(data);
    //e.g. [
		//{"Year": 1996, "Medal": Gold, "minAge":17, "maxAge":31, "medianAge":21}, 
    //{"Year": 2000, "Medal": Silver, "minAge":17, "maxAge":31, "medianAge":21}] 
    
    var margin = {top: 10, right: 30, bottom: 50, left: 50},
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
    
    //find y axis domain
    var maxAge = 0;
    var minAge = 1000;
    data.forEach((entry) => {
      if (entry["maxAge"] > maxAge) {
        maxAge = entry["maxAge"]
      }
      if (entry["minAge"] < minAge) {
        minAge = entry["minAge"]
      }
    });
    //filter data
    data = data.filter((entry) => {
      return entry['Year'] >= start_year && entry['Year'] <= end_year;
    });
    //console.log(data);



    var parseDate =  d3.timeParse("%Y");
    //parse year when necessary
    data.forEach((entry) => {
      if (typeof entry["Year"] === 'number') {
        entry["Year"] = parseDate(entry["Year"]);
      }
    });


    var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
        //console.log(d);
        //return "tooltip";
        return "Year: "+ d.Year.getFullYear() +"<br>Medal: "+d.Medal +"<br>Median Age: "+d.medianAge;
    });
    svg.call(tooltip);


    var x = d3.scaleTime()
          .range([0, width])
          .domain([parseDate(start_year.getFullYear()-1), parseDate(end_year.getFullYear()+1)]);
    //console.log(x);
      //x label
    svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(200, 380)')
    .text('Year');
    
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
    
     //y label
    svg.append('text')
    .attr('class', 'label')
    .attr('transform','translate(-40,200) rotate(270)')
    .text('Age');

    //check whether the mapping preserve the order
    var medalTypes = ['Gold', 'Silver', 'Bronze']
    var color = d3.scaleOrdinal()
      .domain(medalTypes)
      //medal colors
      .range(['#FFD700', '#DCDCDC', '#ED9B4D']);

    //avoid collision
    //var medalPos = {'Gold': -1, 'Silver': -0.4, 'Bronze':0.3, 'None':1};
    //console.log(data);

    var nonData = data.filter((entry) => entry['Medal']==='None');
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
    var medalData = data.filter((entry) => entry['Medal']!=='None');
    var points = svg.selectAll('circle.point')
      .data(medalData);
    //console.log(d3.event.pageX, d3.event.pageY);
  
    points.enter()
      .append('circle')
      .attr('class', 'point')
      .attr('r', 6)
    .merge( points )
        .attr('fill', function(d) {return color(d.Medal)})
        .attr('cx', function(d) { //console.log(d.Year+medalPos[d.Medal]); 
          return x(d.Year); })
        .attr('cy', function(d) { return y(d.medianAge); })
        .on('mouseover', tooltip.show)
        .on("mouseout", tooltip.hide);
  
}



function stackedBar(data) {
  //console.log(data);
  //d3.select("#stackedBar").remove();
  d3.select("#stackedBarsvg").remove();
  //e.g. [{Age: 24, Gold: 1, Silver: 0, Bronze: 0}, {Age: 25, Gold: 1, Silver: 0, Bronze: 0}]
  var age_ls = [];
  var medal_cnt_ls = [];
  var tmp_sum=0;
  data.forEach((entry) => {
    age_ls.push(entry['Age']);
    tmp_sum = entry['Gold'] + entry['Silver'] + entry['Bronze'];
    medal_cnt_ls.push(tmp_sum);
  });
  //sort age
  age_ls.sort((a, b) => a - b);

  //console.log(age_ls);
  //find y range
  var maxMedal = 0;
  maxMedal = d3.max(medal_cnt_ls);
  
  // get all ages
  var groups = age_ls;
  var subgroups = ['Gold', 'Silver', 'Bronze'];

  var margin = {top: 10, right: 30, bottom: 50, left: 50},
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

   //tooltip
   //var tooltip = d3.select("#float-container")
   // .append("div")
   // .attr("class", "stackedBarToolTip");
  var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d) {
         //return "tooltip";
        return "Age: "+d.data.Age+"<br>Gold: "+d.data.Gold +"<br>Silver: "+d.data.Silver + "<br>Bronze: "+d.data.Bronze;
    });
  svg.call(tooltip);


  //axis
  var x = d3.scaleBand()
        .range([0, width])
        .padding([0.2])
        .domain(groups);

  svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));
  //x label
  svg.append('text')
        .attr('class', 'label')
        .attr('transform','translate(200, 380)')
        .text('Age');
  
  var y = d3.scaleLinear()
        .range([ height, 0 ])
        .domain([0, maxMedal+1]);
  
  yAxisTicks = y.ticks()
    .filter(tick => Number.isInteger(tick));

  //y label
  svg.append('text')
  .attr('class', 'label')
  .attr('transform','translate(-40,200) rotate(270)')
  .text('Medals');

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
        .on('mouseover', tooltip.show)
        .on("mouseout", tooltip.hide);
}

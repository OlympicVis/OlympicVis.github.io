window.onload = function() {
    d3.queue()  
      .defer(d3.json, 'data/all_selection_list.json')
      .defer(d3.json, 'data/all_medal_stacked_bar.json')
      .await(function(error, selectorData, medalData) {
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


          stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
          
          selectSeason.addEventListener('change', function() {
            setOptions(selectSport, Object.keys(selectorData[selectSeason.value]));
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);

          });

          selectSport.addEventListener('change', function() {
            setOptions(selectEvent, selectorData[selectSeason.value][selectSport.value]);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
          })

          selectEvent.addEventListener('change', function() {
            //console.log(selectSeason.value, selectSport.value, selectEvent.value);
            //console.log(data[selectSeason.value][selectSport.value][selectEvent.value]);
            stackedBar(medalData[selectSeason.value][selectSport.value][selectEvent.value]);
          })

        }
    })
  };




function stackedBar(data) {
    d3.select("svg").remove();
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

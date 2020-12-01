function plotTornado(data, selectYear, selectMedal) {
    newdata = data.filter(function (elem) {
            return elem.Year=== parseInt(selectYear); 
    });
    //console.log(newdata);
    var age_group_ls = [];
    newdata.forEach(d => {
        age_group_ls.push(d.Age);
    });
    var age_group = [...new Set(age_group_ls)].sort();
    //console.log(age_group);
    //instead of using explicity ages, use range
    Array.range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
    age_range = Array.range(Math.min.apply(null, age_group),Math.max.apply(null, age_group));
    income_ls = ["L", "LM", "UM", "H"];
    xScaleDict = {"L": null, "LM":null, "UM":null, "H":null};
    for (var i in income_ls) {
        levelData = newdata.filter(function (elem) {
            return (elem.Income === income_ls[i])
        });
        //console.log(levelData);
        var chart = tornadoChart(age_range, income_ls[i]);
        d3.select("#income-plot")
        .datum(levelData)
        .call(chart);
    }
}


//here we use the same x and y axis to draw different income-level countries
function tornadoChart(age_group, income_label) {
    
    //the first figure
    if (income_label === 'L') {
        var margin = {top: 20, right: 10, bottom: 40, left: 50}
    }
    else {
        var margin = {top: 20, right: 10, bottom: 40, left: 20}
    }
    
    width = 350 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
  
    x = d3.scaleLinear()
        .range([0, width]);
    //save it
    xScaleDict[income_label] = x;
  
    y = d3.scaleBand()
          .range([0, height])
          .padding(0.1)
          .round(0.1);

    var xAxis = d3.axisBottom(x).tickFormat(function (d) {
            if (d < 0) {
                d = -d;
            };
            return d;
        });
  
    yAxis = d3.axisLeft(y)
        .tickSize(0);
  
    svg = d3.select("#income-plot").append("svg")
        .attr("class", "tornado-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("id", income_label)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var tooltip = d3.tip()
        .attr("class", "d3-tip-tornado")
        .html(function(d) {
            return d.Sex === 'M'? "<div style='background-color:#9BCCF5'>Year:"+ d.Year + "<br>Gender: " + d.Sex + "<br>Age: " + d.Age + "<br>Medals: " + Math.abs(d.Records) + "</div>": 
                      "<div style='background-color:pink'>Year:" + d.Year + "<br>Gender: " + d.Sex + "<br>Age: " + d.Age + "<br>Medals: " + Math.abs(d.Records) + "</div>"
        });

    svg.call(tooltip);
  
    function chart(selection) {
      selection.each(function(data) {
  
        x.domain(d3.extent(data, function(d) { return d.Records; })).nice();
        xAxisTicks = x.ticks(7)
            .filter(tick => Number.isInteger(tick));
        xAxis.tickValues(xAxisTicks);
        //y.domain(data.map(function(d) { return d.Age; }));
        //x.domain(medal_range);

        income_dict = {'L': 'Low-income', 'LM': 'Low-middle income', 'UM': 'Upper-middle income', 'H': 'High-income'}
         //x label
        svg.append('text')
        .attr('class', 'label')
        .attr('transform','translate(16, -7)')
        .text(income_dict[income_label]);


        y.domain(age_range);
  
        var minRecords = Math.min.apply(Math, data.map(function(o){return o.Records;}))

        
        yAxis.tickPadding(Math.abs(x(minRecords) - x(0)) + 10);
        yAxis.tickFormat(function(d) {
            return d%2===0?d:'';
        })

  
        var bar = svg.selectAll(".bar")
            .data(data)
  
        bar.enter().append("rect")
            .attr("class", function(d) { return "bar bar--" + (d.Records < 0 ? "negative" : "positive"); })
            .attr("x", function(d) { return x(Math.min(0, d.Records)); })
            .attr("y", function(d) { return y(d.Age); })
            .attr("width", function(d) { return Math.abs(x(d.Records) - x(0)); })
            .attr("height", y.bandwidth())
            .on("mouseover", tooltip.show)
            .on("mouseout", tooltip.hide);
  
        svg.append("g")
            .attr("class", "tornado-x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
  
        svg.append("g")
            .attr("class", "tornado-y-axis")
            .attr("transform", "translate(" + x(0) + ",0)")
            .call(yAxis);
       
        //x label
        svg.append('text')
            .attr('class', 'label')
            .attr('transform','translate(30, 580)')
            .text('Number of Athletes');
    
        //y label
        if (income_label === 'L') {
            svg.append('text')
                .attr('class', 'label')
                .attr('transform','translate(-30,200) rotate(270)')
                .text('Age');

        }


      });
    }
  
    return chart;
  }

  //darker bars for selected country
  function plotCountryBar(countryData, selectCountry, selectYear, selectMedal) {
    d3.selectAll(".newbar").remove();
    d3.selectAll(".newbar-tornado-y-axis").remove();
    newCountry = countryData.filter(function (elem) {
        return  (elem.Year=== parseInt(selectYear) && elem.Team === selectCountry);
    });
    
    if (newCountry.length === 0) {
        return (`Sorry, we don't have the Olympic data of ${selectCountry} at year ${selectYear}`);
    }
    else {
        var newbar = d3.select("#" + newCountry[0].Income).selectAll(".newbar")
    .data(newCountry);

     //tooltips for the new bar
     var newtooltip = d3.tip()
     .attr("class", "newbar-d3-tip-tornado")
     .html(function(d) {
         return d.Sex === 'M'? "<div style='background-color:steelblue; color:white'>Country: "+ d.Team +"<br>Year:"+ d.Year + "<br>Gender: " + d.Sex + "<br>Age: " + d.Age + "<br>Medals: " + Math.abs(d.Records) + "</div>": 
                   "<div style='background-color:brown; color:white'>Country: "+ d.Team +"<br>Year:" + d.Year + "<br>Gender: " + d.Sex + "<br>Age: " + d.Age + "<br>Medals: " + Math.abs(d.Records) + "</div>"
     });

    svg.call(newtooltip);
    x = xScaleDict[newCountry[0].Income];

    newbar.enter().append("rect")
    .attr("class", function(d) { return "newbar newbar--" + (d.Records < 0 ? "negative" : "positive"); })
    .attr("x", function(d) { return x(Math.min(0, d.Records)); })
    .attr("y", function(d) { return y(d.Age); })
    .attr("width", function(d) { return Math.abs(x(d.Records) - x(0)); })
    .attr("height", y.bandwidth())
    .on("mouseover", newtooltip.show)
    .on("mouseout", newtooltip.hide);;

    //if don't call the axis again, bars will be connected
    
    purey = d3.scaleBand()
        .range([0, height])
        .padding(0.1)
        .round(0.1);
    
    pureyAxis = d3.axisLeft(purey)
        .tickSize(0);

    d3.select("#" + newCountry[0].Income).append("g")
            .attr("class", "newbar-tornado-y-axis")
            .attr("transform", "translate(" + x(0) + ",0)")
            .call(pureyAxis);
        return true;
    }   
  }
  
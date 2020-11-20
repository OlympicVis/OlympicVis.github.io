d3.csv('data/all_tornado_by_income.csv', function(data) {
    data.forEach(d => {
        d.Age = + d.Age;
        d.Income = d.Income;
        d.Medal = d.Medal;
        d.Records = +d.Records;
        d.Season = d.Season;
        d.Sex = d.Sex;
        d.Sport = d.Sport;
        d.Year = +d.Year;
        if (d.Sex == 'F') {
            d.Records = -1 * d.Records;
        }
    });
    //take user input
    newdata = data.filter(function (elem) {
        return (elem.Year === 2014);
    });

    var age_group_ls = [];
    newdata.forEach(d => {
        age_group_ls.push(d.Age);
    });
    var age_group = [...new Set(age_group_ls)].sort();
    //var medal_range = d3.extent(data, function(d) { return d.Records; });

    //income grid
    income_ls = ["L", "LM", "UM", "H"]
    //console.log(newdata);
    //levelData = newdata.filter(function (elem) {
    //    return (elem.Income === "L")
    //});
    //console.log(levelData);
    for (var i in income_ls) {
        levelData = newdata.filter(function (elem) {
            return (elem.Income === income_ls[i])
        });
        //console.log(levelData);
        var chart = tornadoChart(age_group, income_ls[i]);
        d3.select("#income-plot")
        .append("svg")
        .attr("id", income_ls[i])
        .datum(levelData)
        .call(chart);
    }
})
//here we use the same x and y axis
function tornadoChart(age_group, income_label) {
    var tooltip = d3.select("#income-plot")
    .append("div")
    .attr("class", "toolTip")
    .attr("id", income_label);
    var margin = {top: 20, right: 30, bottom: 40, left: 100},
      width = 250 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
    var x = d3.scaleLinear()
        .range([0, width]);
  
    var y = d3.scaleBand()
          .range([0, height])
          .padding(0.1)
          .round(0.1);

    var xAxis = d3.axisBottom(x).tickFormat(function (d) {
            if (d < 0) {
                d = -d;
            };
            return d;
        });
  
    var yAxis = d3.axisLeft(y)
        .tickSize(0)
  
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    function chart(selection) {
      selection.each(function(data) {
  
        x.domain(d3.extent(data, function(d) { return d.Records; })).nice();
        xAxisTicks = x.ticks(7)
            .filter(tick => Number.isInteger(tick));
        xAxis.tickValues(xAxisTicks);
        //y.domain(data.map(function(d) { return d.Age; }));
        //x.domain(medal_range);
        y.domain(age_group);
  
        var minRecords = Math.min.apply(Math, data.map(function(o){return o.Records;}))
        yAxis.tickPadding(Math.abs(x(minRecords) - x(0)) + 10);
  
        var bar = svg.selectAll(".bar")
            .data(data)
  
        bar.enter().append("rect")
            .attr("class", function(d) { return "bar bar--" + (d.Records < 0 ? "negative" : "positive"); })
            .attr("x", function(d) { return x(Math.min(0, d.Records)); })
            .attr("y", function(d) { return y(d.Age); })
            .attr("width", function(d) { return Math.abs(x(d.Records) - x(0)); })
            .attr("height", y.bandwidth())
            .on("mouseover", function(d){
                tooltip
                  .style("left", d3.event.pageX + "px")
                  .style("top", d3.event.pageY + "px")
                  .style("display", "inline-block")
                  .html(d.Sex === 'M'? "<div style='background-color:#9BCCF5'><p>Gender: " + d.Sex + "</p><p>Age: " + d.Age + "</p><p>Medals: " + Math.abs(d.Records) + "</p></div>": 
                  "<div style='background-color:pink'><p>Gender: " + d.Sex + "</p><p>Age: " + d.Age + "</p><p>Medals: " + Math.abs(d.Records) + "</p></div>"
                    //if (d.data.Sex === 'F') {
                    //    return "<div style='color:#9BCCF5'><p>Gender: " + d.data.Sex + "</p><p>Age: " + d.data.Age + "</p><p>Medals: " + Math.abs(d.data.Records) + "</p></div>";
                    //}
                    //else {
                    //    return "<div style='color:pink'><p>Gender: " + d.data.Sex + "</p><p>Age: " + d.data.Age + "</p><p>Medals: " + Math.abs(d.data.Records) + "</p></div>";
                    //}
                  )
            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});
  
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
  
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(0) + ",0)")
            .call(yAxis);
      });
    }
  
    return chart;
  }
  
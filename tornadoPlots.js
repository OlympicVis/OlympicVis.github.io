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
        //age_group_ls.push(d.Age);
    });
    //console.log(data);
    newdata = data.filter(function (elem) {
        //&& (elem.Sport==="Basketball")
        return (elem.Year === 2016) && (elem.Income === 'H') && (elem.Medal === 'Gold');
    });

    var age_group_ls = [];
    newdata.forEach(d => {
        age_group_ls.push(d.Age);
    });
    
    var age_group = [...new Set(age_group_ls)].sort();
    
    var chart = tornadoChart(age_group);
    d3.select("#lowIncomeSvg")
      .datum(newdata)
      .call(chart);
})

function tornadoChart(age_group) {
    var margin = {top: 20, right: 30, bottom: 40, left: 100},
      width = 550 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
    var x = d3.scaleLinear()
        .range([0, width]);
  
    var y = d3.scaleBand()
          .range([0, height])
          .padding(0.1)
          .round(0.1);
  
    var xAxis = d3.axisBottom(x)
        .ticks(7).tickFormat(function (d) {
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
        //y.domain(data.map(function(d) { return d.Age; }));
        y.domain(age_group);
        //console.log(data);
        //console.log(y(20));
        //console.log(y(24));
        //console.log(y(32));
  
        var minRecords = Math.min.apply(Math, data.map(function(o){return o.Records;}))
        yAxis.tickPadding(Math.abs(x(minRecords) - x(0)) + 10);
  
        var bar = svg.selectAll(".bar")
            .data(data)
  
        bar.enter().append("rect")
            .attr("class", function(d) { return "bar bar--" + (d.Records < 0 ? "negative" : "positive"); })
            .attr("x", function(d) { return x(Math.min(0, d.Records)); })
            .attr("y", function(d) { return y(d.Age); })
            .attr("width", function(d) { return Math.abs(x(d.Records) - x(0)); })
            .attr("height", y.bandwidth());
  
      /*
        bar.enter().append('text')
            .attr("text-anchor", "middle")
            .attr("x", function(d,i) {
                return x(Math.min(0, d.Records)) + (Math.abs(x(d.Records) - x(0)) / 2);
            })
            .attr("y", function(d,i) {
                return y(d.Age) + (y.bandwidth() / 2);
            })
            .attr("dy", ".35em")
            .text(function (d) { return d.Records; })
          */
  
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
  
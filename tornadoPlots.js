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
    //default, 1988, all athletes
    drawChart(data, 1988, 'all-medal');

    //update chart based on user selection
	selectBtnYear = document.querySelector('#Year');
	selectBtnYear.addEventListener('change', function() {
            d3.selectAll(".tornado-svg").remove();
            //console.log(selectBtnMedal.value);
            //console.log(selectBtnYear.value);
			drawChart(data, selectBtnYear.value, selectBtnMedal.value);
    });
    
    selectBtnMedal = document.querySelector('#Medal');
    selectBtnMedal.addEventListener('change', function() {
        //console.log(selectBtnMedal.value);
        //console.log(selectBtnYear.value);
        d3.selectAll(".tornado-svg").remove();
        drawChart(data, selectBtnYear.value, selectBtnMedal.value);
    })
})

//predrawing:
function drawChart(data, selectYear, selectMedal) {
    newdata = data.filter(function (elem) {
        return selectMedal === 'all-medal'? (elem.Year=== parseInt(selectYear)): (elem.Year===parseInt(selectYear) && elem.Medal==='Gold');
    });
    //console.log(newdata);
    var age_group_ls = [];
    newdata.forEach(d => {
        age_group_ls.push(d.Age);
    });
    var age_group = [...new Set(age_group_ls)].sort();
    //instead of using explicity ages, use range
    Array.range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
    age_range = Array.range(Math.min.apply(null, age_group),Math.max.apply(null, age_group));
    income_ls = ["L", "LM", "UM", "H"];
    for (var i in income_ls) {
        levelData = newdata.filter(function (elem) {
            return (elem.Income === income_ls[i])
        });
        //console.log(levelData);
        var chart = tornadoChart(age_range, income_ls[i]);
        d3.select("#income-plot")
        //.append("svg")
        //.attr("id", income_ls[i])
        .datum(levelData)
        .call(chart);
    }
}


//here we use the same x and y axis to draw different income-level countries
function tornadoChart(age_group, income_label) {
    //var tooltip = d3.select("#income-plot")
    //.append("div")
    //.attr("class", "toolTip")
    //.attr("id", income_label);

    var margin = {top: 20, right: 30, bottom: 40, left: 100},
      width = 350 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  
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
  
    var svg = d3.select("#income-plot").append("svg")
        .attr("class", "tornado-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
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


        y.domain(age_group);
  
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
                .attr('transform','translate(-40,200) rotate(270)')
                .text('Age');

        }



      });
    }
  
    return chart;
  }
  
// function to create frequencyPlot variables - to export

function frequencyPlot(selection, transition_time, useYAxis, dotRadius, dotColor, dotOpacity, dotColorSelected, dotOpacitySelected, mode) {
    console.log("Creating frequency plot");
    // specify logistical variables
    this.selection = selection;
    this.transition_time = transition_time;
    // this.useYAxis = useYAxis;
    this.freezeOrder = true;
    this.setup = true;
    
    this.dotRadius = dotRadius;
    this.dotColor = dotColor;
    this.dotOpacity = dotOpacity;
    
    this.dotRadiusSelected = this.dotRadius*1.1
    this.dotColorSelected = dotColorSelected;
    this.dotOpacitySelected = dotOpacitySelected;

    this.mode = 'd'; // either bnw (box&whisker) or d (density) - default
    this.switchingMode = false; // indicates whether the mode is currently being switched
    this.labelOpacity = 1;
    this.sortMode = "alphabetical"; // default is sorting by maximum value
    this.sortAttr = "min"; // default is sorting by flavor values

    // specifies all the bins in which to place the datapoints
    this.bins = [];
    // specifies the order of the country indices based on this.selection
    this.rankings = [];

    // specifies the max x value for each country bin, given the current attribute selected
    // this.binsMaxX = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // // store information necessary to create a box-and-whisker plot
    // this.binsMedianX = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // this.bins75perc = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // this.bins25perc = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // this.binsMinX = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // // specifies the max/min x values for each country bin, given the current attribute selected for sorting the countries
    // this.binsMaxXSort = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // this.binsMinXSort = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // this.binsMedianXSort = {
    //     "sports": this.bins.slice(0),
    //     "country": this.bins.slice(0),
    //     "year": this.bins.slice(0),
    //     "gender": this.bins.slice(0)
    // };
    // data split into bins
    this.binned = [];

    // species the coffee IDs of those coffees that are currently selected
    this.selected = [];

    this.sports;
    this.country;
    this.gender;
    this.year;
    this.sports_season;
    this.sports_gender;
    this.country_season;
    this.country_gender;

    this.processed = {
        "sports": this.sports,
        "country": this.country,
        "year": this.gender,
        "gender": this.year,
        "sports_season": this.sports_season,
        "sports_gender":this.sports_gender,
        "country_season":this.country_season,
        "country_gender":this.country_gender
    };

    // create svg element
    this.svg = d3.select('svg.box-plot');

    var svgWidth = +this.svg.attr('width');
    var svgHeight = +this.svg.attr('height');

    this.padding = {t: 41, r: 60, b: 50, l: 140, 
                    x_r: 145, 
                    y_countries_b: 0, x_countries_r: 20, 
                    x_axis_b: 20};

    // compute chart dimensions
    this.chartWidth = svgWidth - this.padding.l - this.padding.r;
    this.chartHeight = svgHeight - this.padding.t - this.padding.b;

    // create the x and y scales
    this.xScale = d3.scaleLinear().range([0, this.chartWidth-this.padding.x_r]);
    this.yScale = d3.scaleBand().range([this.chartHeight-this.padding.x_axis_b, 0]);
    this.yLabelScale = d3.scaleLinear().range([this.chartHeight,0]);
    this.chartScales = {y: this.selection, x: {}};
    
    // create a group element for appending chart elements
    this.chartG = this.svg.append('g')
        .attr('transform', 'translate('+[this.padding.l, this.padding.t]+')');

    // Create groups for the x- and y-axes
    this.xAxisG = this.chartG.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+[0, this.chartHeight-10]+')');
    this.yAxisG = this.chartG.append('g')
        .attr('class', 'y axis')
        //.attr('transform', 'translate('+[0, this.chartHeight-10]+')');
    
    var freqPlot = this;

    this.xAxisLabel = this.chartG.append('text')
        .attr('class', 'x axisLabel')
        .attr('transform', 'translate('+((this.chartWidth-this.padding.x_r)/2)+','+(svgHeight-this.padding.b)+')')
        .text('Age');
        
    this.yAxisLabel = this.chartG.append('text')
        .attr('class', 'y axisLabel')
        .attr('transform', 'translate('+((this.chartWidth-this.padding.x_r)/2)+',-25)')
        .text(function(d) {
            var att = freqPlot.selection;
            var att = att[0].toUpperCase() + att.slice(1);

            return "Age Distribution by "+att;
        });
}

// called when selected elements changed
frequencyPlot.prototype.onYScaleChanged = function(dataset) {
    console.log("changing Y scale");
    d3.select(".sidenav a.active").classed('active', false);
    d3.select(".sidenav a."+this.selection)
        .classed('active', true);
    
    // Save current selection to global chartScales
    this.chartScales.y = this.selection;
    
    // Update chart
    if (dataset !== null) { this.updateChart(dataset); }
}


frequencyPlot.prototype.updateY = function(dataset, mode) {
    this.sortMode = mode;
    //this.sortAttr = attr;
    this.chartScales.x = {};

    var freqPlot = this;

    var whichAttr = freqPlot.selection;
    
    if (freqPlot.sortAttr === "alphabetical") { whichAttr = freqPlot.selection; }
    //if (freqPlot.freezeOrder !== true || freqPlot.setup) { whichAttr = freqPlot.sortAttr; }


    // determine the rankings of each country
    if (true || freqPlot.freezeOrder !== true || freqPlot.setup == true) {
        console.log(whichAttr);
        // console.log(freqPlot.processed);
        // console.log(freqPlot.processed[whichAttr]);
        
        // sort alphabetically
        if (mode === "alphabetical") {

            var indices = freqPlot.processed[whichAttr].sort(function(x, y){return x.key > y.key ? 1 : x.key == y.key ? 0 : -1});
        }
        // sort by maximum value
        else if (mode === "max") {
            
            var indices = freqPlot.processed[whichAttr].sort(function(x, y){return x.val.max > y.val.max ? 1 : x.val.max == y.val.max ? 0 : -1});
            indices = indices.reverse();
        }
        // sort by minimum value
        else if (mode === "min") {
            var indices = freqPlot.processed[whichAttr].sort(function(x, y){return x.val.min > y.val.min ? 1 : x.val.min == y.val.min ? 0 : -1});
        }
        // sort by median value
        else if (mode === "median") {
            var indices = freqPlot.processed[whichAttr].sort(function(x, y){return x.val.median > y.val.median ? 1 : x.val.median == y.val.median ? 0 : -1});
            indices = indices.reverse();
        }
        // sort by number of athlete
        else if (mode === "num") {
            var indices = freqPlot.processed[whichAttr].sort(function(x, y){return x.val.length > y.val.length ? 1 : x.val.length == y.val.length ? 0 : -1});
            indices = indices.reverse();
            //console.log(indices);
        }
        // console.log(indices, "indices");
        freqPlot.rankings = indices;

        freqPlot.setup = false;
    }

    // dataset.forEach(function(d) {
    //     d.rank = freqPlot.bins.length - freqPlot.rankings.indexOf(freqPlot.bins.indexOf(d.countryOfOrigin));
    // });

    //console.log(dataset);
    return dataset;
}


frequencyPlot.prototype.updateChart = function(dataset) {
    console.log("updating chart");

    /**********************
     Store a reference to the visualization
    **********************/
    var freqPlot = this;
    var dataset = freqPlot.updateY(dataset, freqPlot.sortMode)
    var keys = freqPlot.rankings.map(function(d){return d.key;});
    

    var svg =  this.chartG;
    // Show the Y scale
    this.yScale = d3.scaleBand()
    .range([this.chartHeight-this.padding.x_axis_b, 0])
    .domain(keys)
    .padding(.2);
    // console.log(keys)

    freqPlot.yAxisG
    .transition()
    .duration(freqPlot.transition_time)
    .call(d3.axisLeft(this.yScale).tickSize(0))
    //.select(".domain").remove()

    // Show the X scale
    this.xScale = d3.scaleLinear()
    .range([0, this.chartWidth-this.padding.x_r])
    .domain([0,80])

    var y = this.yScale;
    var x = this.xScale;
    freqPlot.xAxisG.transition()
        .duration(freqPlot.transition_time)
        .call(d3.axisBottom(freqPlot.xScale));

    // Color scale
    var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([10,60])

    var bnw = freqPlot.chartG.selectAll('.vertLines')
    .data(freqPlot.rankings)

    var bnwEnter = bnw.enter()
    .append('g')
    .attr('class', 'vertLines');

    bnwEnter.append('line')
    .attr('width', 40)
    .attr('fill-opacity', 0);

    // bnw.merge(bnwEnter)
    //     .transition();

    // Show the main vertical line
    freqPlot.chartG
    .selectAll(".vertLines line")
    .data(freqPlot.rankings)
    .transition()
    .duration(freqPlot.transition_time)
        .attr("x1", function(d){return(x(d.value.min))})
        .attr("x2", function(d){return(x(d.value.max))})
        .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("stroke", "black")
        .attr("width", 40)
        .style('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });


    // rectangle for the main box
    var box = freqPlot.chartG.selectAll('.boxes')
        .data(freqPlot.rankings)
    var boxEnter = box.enter()
        .append('g')
        .attr('class', 'boxes')
    boxEnter.append('rect')

    freqPlot.chartG.selectAll('.boxes rect')
    .data(freqPlot.rankings)
    .transition()
    .duration(freqPlot.transition_time)
        .attr("x", function(d){return(x(d.value.q1))}) // console.log(x(d.value.q1)) ;
        .attr("width", function(d){ ; return(x(d.value.q3)-x(d.value.q1))}) //console.log(x(d.value.q3)-x(d.value.q1))
        .attr("y", function(d) { return y(d.key); })
        .attr("height", y.bandwidth() )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
        .style('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });


    // Show the median
    var w = y.bandwidth()
    var medians = freqPlot.chartG.selectAll('.medians')
        .data(freqPlot.rankings)
    var mediansEnter = medians.enter()
        .append('g')
        .attr('class', 'medians')
    mediansEnter.append('rect')
        .attr('width', 1)
        .attr('height', w);
        
    

    medians.merge(mediansEnter)
        .data(freqPlot.rankings)
        .transition()
        .duration(freqPlot.transition_time)
        .attr('transform', function(d, i) {
            var tx = x(d.value.median);
            var ty = y(d.key)
            return 'translate('+[tx,ty]+')';
        })
        // .attr("y1", function(d){return(y(d.key))})
        // .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
        // .attr("x1", function(d){return(x(d.value.median))})
        // .attr("x2", function(d){return(x(d.value.median))})
        .attr("stroke", "black")
        .style('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });

        //medians.exit().remove()
    // freqPlot.chartG.selectAll(".median line")
    // .data(freqPlot.rankings)
    // .transition()
    // .duration(freqPlot.transition_time)
    //     .attr("y1", function(d){return(y(d.key))})
    //     .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
    //     .attr("x1", function(d){return(x(d.value.median))})
    //     .attr("x2", function(d){return(x(d.value.median))})
    //     .attr("stroke", "black")
    //     .style("width", 80)
    //     .style('opacity', function(d) {
    //         if (freqPlot.mode === "bnw") { return 1; }
    //         else { return 0; }
    //     });


    // create a tooltip
    var tooltip = d3.select("svg.box-plot")
    .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("font-size", "16px")
    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 1)
    tooltip
        .html("<span style='color:grey'>Age: </span>" + d.Age) // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    var mousemove = function(d) {
    tooltip
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    var mouseleave = function(d) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

    // Add individual points with jitter
    var jitterWidth = y.bandwidth() * 0.7
    var dots = this.chartG.selectAll(".dot")
    .data(dataset);

    var dotsEnter = dots.enter()
    .append('g') // create a g element
    .attr('class', 'dot'); // assign a class ID of dot to the element

    dotsEnter.append("circle")
        //.attr("cx", function(d){ return(x(d.Age))})
        //.attr("cy", function(d){ return( y(d[freqPlot.selection]) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth )})
        .style("fill", function(d){ return(myColor(+d.Age)) })
        .attr('r', freqPlot.dotRadius)
        .style('opacity', function() {
            if (freqPlot.mode === "bnw") { return 0; }
                return freqPlot.dotOpacity; 
        })
        //.on("mouseover", mouseover)
        //.on("mousemove", mousemove)
        //.on("mouseleave", mouseleave)

    dots.merge(dotsEnter)
        .transition()
        .attr('transform', function(d) {
            var tx = x(d.Age);
            //console.log(d.rank);
            var ty = y(d[freqPlot.selection]) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth;
            //console.log(ty);
            return 'translate('+[tx,ty]+')';
        });

    dots.exit().remove();


   



    

    /**********************
     Handle button clicks
    **********************/
    // toggle whether country labels are on or off
    //d3.selectAll('button#countryLabelsToggle').on('click', function(d) { toggleCountryLabels(freqPlot, coffee); });

    d3.selectAll('span#switchModeSwitch').on('click', function(d) { switchMode(freqPlot, dataset); });
    // reset (i.e., deselect all selected data points)
    

    // Set up evet handlers for each radio button 
    // Source: https://www.dyn-web.com/tutorials/forms/radio/onclick.php
    // get list of radio buttons with name 'optradio'
    // var sz = document.forms['sortForm'].elements['optradio'];
    // var sz2 = document.forms['fiterForm'].elements['optradio'];

    // // loop through list
    // for (var i=0, len=sz.length; i<len; i++) {
    //     sz[i].onclick = function() { // assign onclick handler function to each

    //         // disable/enable dropdown, as appropriate
    //         if (this.value=="attribute") {
    //             //document.forms['sortAttr'].elements["dropdown"].disabled = false;
    //             document.getElementById('attDropdown').disabled = false;
    //             document.getElementById('max').disabled = false;
    //             document.getElementById('min').disabled = false;
    //             document.getElementById('median').disabled = false;
    //             freqPlot.freezeOrder = false;
    //             if (document.getElementById('max').checked) { freqPlot.sortMode = 'max'; }
    //             else if (document.getElementById('min').checked) { freqPlot.sortMode = 'min'; }
    //             else if (document.getElementById('median').checked) { freqPlot.sortMode = 'median'; }

    //             var att = document.getElementById('attDropdown');
    //             att = att.options[att.selectedIndex].value;
    //             // specify attribute (flavor, aroma, etc.)
    //             freqPlot.updateY(coffee, freqPlot.sortMode, att);
    //             freqPlot.updateChart(coffee);
    //             freqPlot.freezeOrder = true;
                
    //         }
    //         else { 
    //             document.getElementById('attDropdown').disabled = true;
    //             document.getElementById('max').disabled = true;
    //             document.getElementById('min').disabled = true;
    //             document.getElementById('median').disabled = true;
    //             document.getElementById('max').checked = true;
    //             document.getElementById('min').checked = false;
    //             document.getElementById('median').checked = false;

    //             if (this.value=="name" || this.value=="overall" || this.value=="num") {
    //                 // put clicked radio button's value in total field
    //                 freqPlot.freezeOrder = false;
    //                 // specify mode (max, min, median, etc.)
    //                 freqPlot.updateY(coffee, this.value, freqPlot.sortAttr);
    //                 freqPlot.updateChart(coffee);
    //                 freqPlot.freezeOrder = true;
    //             }
    //         }
    //     };
    // }
    // for (var i=0, len=sz2.length; i<len; i++) {
    //     sz2[i].onclick = function() {
    //         if (this.value=="max" || this.value=="min" || this.value=="median") {
    //             // put clicked radio button's value in total field
    //             freqPlot.freezeOrder = false;
    //             // specify mode (max, min, median, etc.)
    //             freqPlot.updateY(coffee, this.value, freqPlot.sortAttr);
    //             freqPlot.updateChart(coffee);
    //             freqPlot.freezeOrder = true;
    //         }
    //     }
    // }
    // //document.forms['sortAttr'].elements['dropdown'].onchange = function(e) {
    // document.getElementById('attDropdown').onchange = function(e) {
    //     freqPlot.freezeOrder = false;
    //     if (document.getElementById('max').checked) {
    //         freqPlot.sortMode = 'max';
    //     } else if (document.getElementById('min').checked) {
    //         freqPlot.sortMode = 'min';
    //     } else if (document.getElementById('median').checked) {
    //         freqPlot.sortMode = 'median';
    //     }
    //     // specify attribute (flavor, aroma, etc.)
    //     freqPlot.updateY(coffee, freqPlot.sortMode, this.value);
    //     freqPlot.updateChart(coffee);
    //     freqPlot.freezeOrder = true;
    // }
}




function switchMode(freqPlot, dataset) {
    //console.log("GOT HERE... switching");
    if (freqPlot.mode === "d") { freqPlot.mode = 'bnw'; }
    else { freqPlot.mode = 'd'; }

    console.log("Current mode: ",freqPlot.mode);

    if (freqPlot.mode == 'bnw') {
        // make the dots invisible
        var dots = d3.selectAll('circle');
        dots.style('opacity', function(d) {
            return 0;
        });

        // make the box and whiskers visible
        var bnwMedians = d3.selectAll('line');
        bnwMedians.style('opacity', 1);
        bnwMedians = d3.selectAll('rect');
        bnwMedians.style('opacity', 1);
    }
    else {
        // make the dots visible
        var dots = d3.selectAll('circle');
            dots.style('opacity', freqPlot.dotOpacity)
            .style('r', freqPlot.dotRadius);

        //make the box and whiskers invisible
        var bnw = d3.selectAll('line');
        bnw.style('opacity', 0);

        var bnw = d3.selectAll('rect');
        bnw.style('opacity', 0);
    }
    freqPlot.switchingMode = true;
    //freqPlot.updateChart(dataset);
}

export { frequencyPlot };
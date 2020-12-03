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
    this.binned = [];

    // species the coffee IDs of those coffees that are currently selected
    this.selected = [];
    this.checked = ['Summer', 'Winter'];

    this.processed = {
        "sports": null,
        "country": null,
        "year": null,
        "gender": null,
        "sports_season": null,
        "sports_gender":null,
        "country_season":null,
        "country_gender":null,
        "year_season": null,
        "year_gender":null,
    };

    // create svg element
    this.svg = d3.select('svg.box-plot');

    var svgWidth = +this.svg.attr('width');
    var svgHeight = +this.svg.attr('height');

    this.padding = {t: 41, r: 60, b: 50, l: 140, 
                    x_r: 45, 
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

    var toSort = freqPlot.processed[whichAttr];
    
    if (freqPlot.checked.length == 1) {
        if (freqPlot.checked[0] === "Summer" || freqPlot.checked[0] === "Winter") {
            toSort = freqPlot.processed[whichAttr+'_season'].filter(d=> (d.key === freqPlot.checked[0])).map(d=> d.values)[0]
        } else {
            toSort = freqPlot.processed[whichAttr+'_gender'].filter(d=> (d.key === freqPlot.checked[0])).map(d=> d.values)[0]
        }
    }
    // console.log(freqPlot.processed[whichAttr+'_season'].filter(d=> (d.key == freqPlot.checked[0])))
    // console.log(freqPlot.processed[whichAttr+'_season'])
    // console.log(toSort)



    // determine the rankings of each country
    if (true || freqPlot.freezeOrder !== true || freqPlot.setup == true) {
        // console.log(freqPlot.processed);
        // console.log(freqPlot.processed[whichAttr]);
        
        // sort alphabetically
        if (mode === "alphabetical") {

            var indices = toSort.sort(function(x, y){return x.key > y.key ? 1 : x.key == y.key ? 0 : -1});
        }
        // sort by maximum value
        else if (mode === "max") {
            
            var indices = toSort.sort(function(x, y){return x.value.max > y.value.max ? 1 : x.value.max == y.value.max ? 0 : -1});
            indices = indices.reverse();
        }
        // sort by minimum value
        else if (mode === "min") {
            // console.log(freqPlot.processed[whichAttr])
            var indices = toSort.sort(function(x, y){return x.value.min > y.value.min ? 1 : x.value.min == y.value.min ? 0 : -1});
        }
        // sort by median value
        else if (mode === "median") {
            var indices = toSort.sort(function(x, y){return x.value.median > y.value.median ? 1 : x.value.median == y.value.median ? 0 : -1});
            indices = indices.reverse();
        }
        // sort by number of athlete
        else if (mode === "num") {
            var indices = toSort.sort(function(x, y){return x.value.length > y.value.length ? 1 : x.value.length == y.value.length ? 0 : -1});
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

    // console.log(freqPlot.rankings);
    return dataset;
}


frequencyPlot.prototype.updateChart = function(dataset) {
    console.log("updating chart");

    /**********************
     Store a reference to the visualization
    **********************/
    var freqPlot = this;
    var dataset = freqPlot.updateY(dataset, freqPlot.sortMode)
    // console.log(freqPlot.rankings, "ranked list")
    var keys = freqPlot.rankings.map(function(d){return d.key;});
    // console.log(keys)

    this.svg.call(zoom);

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
    .selectAll('text')
    .attr('font-size', Math.min(12, this.yScale.bandwidth() * 1))

    // Show the X scale
    this.xScale = d3.scaleLinear()
    .range([0, this.chartWidth-this.padding.x_r])
    .domain([0,80])

    var y = this.yScale;
    var x = this.xScale;
    freqPlot.xAxisG
        .transition()
        .duration(freqPlot.transition_time)
        .call(d3.axisBottom(freqPlot.xScale));

    // Color scale
    var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateInferno)
    .domain([10,60])

    d3.selectAll(".vertLines").remove();
    d3.selectAll(".boxes").remove();
    d3.selectAll(".medians").remove();

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

    // console.log(freqPlot.rankings, "len")
    // console.log(freqPlot.rankings.map(d=> d.value), "before viz")
    // Show the main vertical line
    freqPlot.chartG
    .selectAll(".vertLines line")
    .data(freqPlot.rankings)
    // .transition()
    // .duration(freqPlot.transition_time)
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
    // .transition()
    // .duration(freqPlot.transition_time)
        .attr("x", function(d){return(x(d.value.q1))}) // console.log(x(d.value.q1)) ;
        .attr("width", function(d){ ; return(x(d.value.q3)-x(d.value.q1))}) //console.log(x(d.value.q3)-x(d.value.q1))
        .attr("y", function(d) { return y(d.key); })
        .attr("height", y.bandwidth() )
        .attr("stroke", "black")
        .style("fill", "#F6DBA5")
        .style('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return .5; }
            else { return 0; }
        });


    // Show the median
    var w = y.bandwidth()
    var medians = freqPlot.chartG.selectAll('.medians')
        .data(freqPlot.rankings)
    var mediansEnter = medians.enter()
        .append('g')
        .attr('class', 'medians')
    mediansEnter.append('line')
        .attr('width', 1)
        .attr('height', w);
        
        //medians.exit().remove()
    freqPlot.chartG.selectAll(".medians line")
        .attr("y1", function(d){return(y(d.key))})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth())})
        .attr("x1", function(d){return(x(d.value.median))})
        .attr("x2", function(d){return(x(d.value.median))})
        .attr("stroke", "black")
        .style("width", 120)
        .style('opacity', function(d) {
            if (freqPlot.mode === "bnw") { return 1; }
            else { return 0; }
        });


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
        //return(myColor(+d.Age))
        .style("fill", function(d){ 
            if (d.season === 'Winter') {return '#0286c3'} else {return '#ee2f4d'} })
        .attr('r', freqPlot.dotRadius)
        .style('opacity', function() {
            if (freqPlot.mode === "bnw") { return 0; }
                return freqPlot.dotOpacity; 
        })
        //.on("mouseover", mouseover)
        //.on("mousemove", mousemove)
        //.on("mouseleave", mouseleave)

    var yAxisLabel = freqPlot.chartG.selectAll('.y.axisLabel')
        .text(function(d) {
            var att = freqPlot.selection;
            var att = att[0].toUpperCase() + att.slice(1);

            return "Age Distribution by "+att;
        });
        
    dots.merge(dotsEnter)
        .transition()
        .duration(freqPlot.transition_time)
        .attr('transform', function(d) {
            var tx = x(d.Age);
            //console.log(d.rank);
            var ty = y(d[freqPlot.selection]) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth;
            //console.log(ty);
            return 'translate('+[tx,ty]+')';
        });


    //dots.exit().remove();


    // var zoom = d3.zoom()
    //   .scaleExtent([.5, 8])  // This control how much you can unzoom (x0.5) and zoom (x20)
    //   .extent([[0, 0], [freqPlot.chartWidth, freqPlot.chartHeight]])
    //   .on("zoom", updateZoom);

    function zoom(svg) {
        //const extent = [[freqPlot.padding.l, freqPlot.padding.t], [freqPlot.chartWidth - freqPlot.padding.l, freqPlot.chartHeight - freqPlot.padding.b]]; 
        const extent = [[0, 0], [freqPlot.chartWidth - freqPlot.padding.x_r, freqPlot.chartHeight -  freqPlot.padding.x_axis_b]]
        //const extent = [[freqPlot.padding.l, freqPlot.padding.t], [freqPlot.chartWidth + freqPlot.padding.l - freqPlot.padding.x_r, freqPlot.chartHeight + freqPlot.padding.t- freqPlot.padding.x_axis_b]]
        svg.call(d3.zoom()
            .scaleExtent([1, 30])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", updateZoom));

    }

    // freqPlot.chartG.append("rect")
    //   .attr("width", freqPlot.chartWidth)
    //   .attr("height", freqPlot.chartHeight)
    //   .style("fill", "none")
    //   .style("pointer-events", "all")
    //   .attr('transform', 'translate(' + freqPlot.padding.l + ',' + freqPlot.padding.t + ')')
    //   .call(zoom);
    
    function updateZoom() {

        y.range([freqPlot.chartHeight - freqPlot.padding.x_axis_b, 0].map(d => d3.event.transform.applyY(d)));
        freqPlot.chartG.selectAll(".vertLines line")
        .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)});

        freqPlot.chartG.selectAll(".boxes rect")
        .attr("y", function(d) { return y(d.key); })
        .attr("height", y.bandwidth() )

        freqPlot.chartG.selectAll(".medians line")
        .attr("y1", function(d){return(y(d.key))})
        .attr("y2", function(d){return(y(d.key) + y.bandwidth())});

        freqPlot.yAxisG
            .call(d3.axisLeft(y).tickSize(0))

        freqPlot.yAxisG.selectAll('text')
            .attr('font-size', Math.min(12, y.bandwidth() * 1))

        //freqPlot.svg.selectAll(".y.axis").call(freqPlot.yAxisG);
    
        // update circle position
        jitterWidth = y.bandwidth() * 0.7
        freqPlot.chartG
          .selectAll(".dot")
          .attr('transform', function(d) {
            var tx = x(d.Age);
            //console.log(d.rank);
            var ty = y(d[freqPlot.selection]) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth;
            //console.log(ty);
            return 'translate('+[tx,ty]+')';
        });
        //   .attr('cx', function(d) {return x(d.Age)})
        //   .attr('cy', function(d) {return y(d[freqPlot.selection])+ (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth;});
      }
    

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
    var sz = document.forms['sortForm'].elements['optradio'];
    // console.log(document.forms['filterForm'])
    var sz2 = document.forms['filterForm'].elements['optradio'];

    // loop through list
    for (var i=0, len=sz.length; i<len; i++) {
        sz[i].onclick = function() { // assign onclick handler function to each
            console.log("click")

            // disable/enable dropdown, as appropriate
            if (this.value=="age") {
                document.getElementById('attDropdown').disabled = false;

                var att = document.getElementById('attDropdown');
                att = att.options[att.selectedIndex].value;
                // console.log(att)
                freqPlot.updateY(dataset, att);
                freqPlot.updateChart(dataset);
                //freqPlot.freezeOrder = true;
                
            }
            else { 
                document.getElementById('attDropdown').disabled = true;

                if (this.value=="alphabetical" || this.value=="num") {

                    freqPlot.updateY(dataset, this.value);
                    freqPlot.updateChart(dataset);
                }
            }
        };
    }
    for (var i=0, len=sz2.length; i<len; i++) {
        sz2[i].onclick = function() {
            if (this.value=="season") {
                freqPlot.checked = ["Summer", "Winter"]
                //document.getElementById('gender').disabled = true;
                document.getElementById('summer').checked = "checked";
                document.getElementById('winter').checked = "checked";
                document.getElementById('female').checked = true;
                document.getElementById('male').checked = true;
                document.getElementById('female').disabled = true;
                document.getElementById('male').disabled = true;
                document.getElementById('summer').disabled = false;
                document.getElementById('winter').disabled = false;
                

                freqPlot.updateChart(dataset)

                freqPlot.chartG.selectAll('.dot circle')
                .style("fill", function(d){ 
                    if (d.season === 'Winter') {return '#0286c3'} else {return '#ee2f4d'} 
                })
                .style("opacity", freqPlot.dotOpacity)

                
            if (freqPlot.mode == 'bnw') {
                freqPlot.chartG.selectAll('.dot circle')
                .style("opacity", 0.1)
            }


 
            } else {
                freqPlot.checked = ["F", "M"]
                //document.getElementById('season').disabled = true;
                document.getElementById('female').checked = true;
                document.getElementById('male').checked = true;
                document.getElementById('summer').checked = true;
                document.getElementById('winter').checked = true;
                document.getElementById('summer').disabled = true;
                document.getElementById('winter').disabled = true;
                document.getElementById('female').disabled = false;
                document.getElementById('male').disabled = false;
                

                freqPlot.updateChart(dataset)

                freqPlot.chartG.selectAll('.dot circle')
                .style("fill", function(d){ 
                    if (d.gender == 'M') {return '#fbb22e'} else {return '#168c39'} 
                })
                .style("opacity", freqPlot.dotOpacity)
            }


            if (freqPlot.mode == 'bnw') {
                freqPlot.chartG.selectAll('.dot circle')
                .style("opacity", 0.1)
            }
        }
    }

    //document.forms['sortAttr'].elements['dropdown'].onchange = function(e) {
    document.getElementById('attDropdown').onchange = function(e) {
        
        freqPlot.updateY(dataset, this.value);
        freqPlot.updateChart(dataset);
    }

    document.getElementById('summer').onclick = function() {
        // update the checked list
        if (this.checked) {
            freqPlot.checked.push('Summer')
            freqPlot.updateChart(dataset);
        } else {
            remove(freqPlot.checked, 'Summer')
        }

        if ( this.checked ) {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.season == 'Summer'
                })
                .style("opacity", freqPlot.dotOpacity)
        } else {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.season == 'Summer'
                })
                .style("opacity", 0)
        }

        freqPlot.updateChart(dataset);
        
    };

    document.getElementById('winter').onclick = function() {
        if (this.checked) {
            freqPlot.checked.push('Winter')
            freqPlot.updateChart(dataset);
        } else {
            remove(freqPlot.checked, 'Winter')
        }

        if ( this.checked ) {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.season == 'Winter'
                })
                .style("opacity", freqPlot.dotOpacity)
        } else {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.season == 'Winter'
                })
                .style("opacity", 0)
        }
        freqPlot.updateChart(dataset);
    };



    document.getElementById('female').onclick = function() {
        if (this.checked) {
            freqPlot.checked.push('F')
            freqPlot.updateChart(dataset);

        } else {
            remove(freqPlot.checked, 'F')
        }
        if ( this.checked ) {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.gender == 'F'
                })
                .style("opacity", freqPlot.dotOpacity)
        } else {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.gender == 'F'
                })
                .style("opacity", 0)
        }

        freqPlot.updateChart(dataset);
        
    };


    document.getElementById('male').onclick = function() {
        if (this.checked) {
            freqPlot.checked.push('M')
            freqPlot.updateChart(dataset);

        } else {
            remove(freqPlot.checked, 'M')
        }

        if ( this.checked ) {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.gender == 'M'
                })
                .style("opacity", freqPlot.dotOpacity)
        } else {
            freqPlot.chartG.selectAll('.dot circle')
                .filter( function (d) {
                    return d.gender == 'M'
                })
                .style("opacity", 0)
        }

        freqPlot.updateChart(dataset);
        
    };

    if (freqPlot.checked.length == 0) {
        var bnw = d3.selectAll('line');
        bnw.style('opacity', 0);
    
        var bnw = d3.selectAll('rect');
        bnw.style('opacity', 0);
    }
}


function remove(arr, el) {
    for( var i = 0; i < arr.length; i++){ 
    
        if ( arr[i] === el) { 
    
            arr.splice(i, 1); 
        }
    
    }
}

function switchMode(freqPlot, dataset) {
    //console.log("GOT HERE... switching");
    if (freqPlot.mode === "d") { freqPlot.mode = 'bnw'; }
    else { freqPlot.mode = 'd'; }

    console.log("Current mode: ",freqPlot.mode);
    //freqPlot.updateChart(dataset);

    if (freqPlot.mode == 'bnw') {

        // make the box and whiskers visible
        var bnwMedians = d3.selectAll('line');
        bnwMedians.style('opacity', 1);
        bnwMedians = d3.selectAll('rect');
        bnwMedians.style('opacity', 0.5);

        // make the filtered dots less visible
        
        var dots = d3.selectAll('circle')
        dots.style('opacity', function(d) {
            if (freqPlot.checked.indexOf(d.season) != -1 || freqPlot.checked.indexOf(d.gender)!= -1){
                return 0.1
            } else {
                return 0;
            }
        })
    }
    else {
        // make the dots visible
        console.log(freqPlot.checked)

        var dots = d3.selectAll('circle')
            
            dots.style('opacity', function(d) {
                if (freqPlot.checked.indexOf(d.season) != -1 || freqPlot.checked.indexOf(d.gender)!= -1){
                    return freqPlot.dotOpacity
                } else {
                    return 0;
                }
            })
            .style('r', freqPlot.dotRadius);


        //make the box and whiskers invisible
        var bnw = d3.selectAll('line');
        bnw.style('opacity', 0);

        var bnw = d3.selectAll('rect');
        bnw.style('opacity', 0);
    }
    freqPlot.switchingMode = true;
    //freqPlot.updateChart(dataset);
    if (freqPlot.checked.length == 0) {
        var bnw = d3.selectAll('line');
        bnw.style('opacity', 0);
    
        var bnw = d3.selectAll('rect');
        bnw.style('opacity', 0);

        var dots = d3.selectAll('circle');
        dots.style('opacity', function(d) {
            return 0;
        });
    }
}

export { frequencyPlot };
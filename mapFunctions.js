function updateMap(jsonFeature, getData, selectYear) {
    //init
    var format = d3.format(",");
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 280 - margin.top - margin.bottom;
    scale0 = (width - 1) / 2 / Math.PI, active = d3.select(null);
    var projection = d3.geoMercator()
                    .translate([width / 1.8, height / 1.5])
                    .scale([120]);
    var path = d3.geoPath().projection(projection);
    var subgroups = ["L", "LM", "UM", "H", "NA"];
    var numSubgroups = [0, 1, 2, 3, 4];
    var legendText = ["Low Income", "Low Middle", "Upper Middle","High Income", "NA"];
    var colorMap = {}; 
    subgroups.forEach((key, i) => colorMap[key] = numSubgroups[i]);
    var colorTextMap = {};
    legendText.forEach((key, i) => colorTextMap[key] = numSubgroups[i]);
    var color = d3.scaleOrdinal()
                .domain(numSubgroups)
                .range(["rgb(215, 25, 28)","rgb(253,174,97)","rgb(254,224,139)","rgb(171,221,164)" , "rgb(0,0,0)"]);
    //legend
    var legend = d3.select("#map").append("svg")
		      			.attr("class", "legend")
		     			.attr("width", 140)
		    			.attr("height", 200)
		   				.selectAll("g") 
						.data(legendText) 
		   				.enter()
		   				.append("g")
		     			.attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; });
    legend.append("rect")
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", function(d) { return color(colorTextMap[d])});
    legend.append("text")
                .data(legendText)
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .text(function(d) { return d; });

    //plot
    selectYear = parseInt(selectYear);
	width = 1000 - margin.left - margin.right,
	height = 280 - margin.top - margin.bottom;
	var svg = d3.select("#map")
			.append("svg")
			.attr("id", "mapsvg")
			.attr("width", width)
			.attr("height", height);


	var tip = d3.tip().attr('class','d3-tip-map')
			.offset([-10, 0])
			.html(function(d){
  		return "<h5>"+d.properties.name+"</h5>"
  //return "<span style='background-color: gainsboro'> <strong> Country: </strong> <span <strong>" +d.properties.name+ "</strong> </span></span>";
	});

	svg.call(tip);

	var zoom = d3.zoom()
		.on('zoom', function() {
	    Scheme.attr('transform', d3.event.transform);
	  })

	//recolor
	var Scheme =  svg.append("g")
					    .attr("class", "countries")
					    .selectAll("path")
						.data(jsonFeature)
						.enter()
						.append("path")
						.attr('class', 'path')
						.attr("d", path)
						.on("click", reset)
						.call(zoom)
						.style("stroke", "#fff")
						.style("stroke-width", "1")
	//console.log(Scheme);

	Scheme.attr("fill",  function(d){
		tmpData = [];
		//start from 1987
		tmpData = getData[selectYear-1987].values.filter(function (countries) {
			return countries.Country == d.properties.name;
		});
		//default color
		var nowColor = 'rgb(0,0,0)';
		//some countries have missing years
		if (tmpData.length!== 0) {
			nowColor = color(colorMap[tmpData[0].Income]);
		}
		return nowColor;
		
	})
		.style('stroke', 'white')
		.style('stroke-width', 1.5)
		.style("opacity",0.8)
		.style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
        });



        d3.select('#zoom-in').on('click', function() {
          // Smooth zooming
        	zoom.scaleBy(svg.transition().duration(750), 1.3);
        });

        d3.select('#zoom-out').on('click', function() {
          // Ordinal zooming
          zoom.scaleBy(svg, 1 / 1.3);
        });
        //reset zooming
        d3.select('#reset').on("click", reset);
		// .on('mouseover', tip.show)
		// .on('mouseout', tip.hide);
		function reset() {
		  active.classed("active", false);
		  active = d3.select(null);

		  svg.transition()
		      .duration(300)
		      // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
		      .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
		}
		// zoom reset for function
		function reseted() {
		  svg.transition().duration(750).call(
		    zoom.transform,
		    d3.zoomIdentity,
		    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
		  );
		}
}
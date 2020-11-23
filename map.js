var width = 900,
    height = 700, scale0 = (width - 1) / 2 / Math.PI;
var format = d3.format(",");

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
//console.log(subgroups);
//console.log(legendText);
  
var color = d3.scaleOrdinal()
			  .domain(numSubgroups)
			  .range(["rgb(215, 25, 28)","rgb(253,174,97)","rgb(254,224,139)","rgb(171,221,164)" , "rgb(0,0,0)"]);

			  /*
var svgBox = d3.select("#map")
      		.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("border", 10);

var borderPath = svgBox.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("height", height)
			.attr("width", width)
			.style("stroke", "black")
			.style("fill", "none")
			.style("stroke-width", 10);
			*/

var svg = d3.select("#map")
			.append("svg")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("border", 10);


var tip = d3.tip().attr('class','d3-tip-map')
.html(function(d){
  return "<h5>"+d.properties.name+"</h5>"
  //return "<span style='background-color: gainsboro'> <strong> Country: </strong> <span <strong>" +d.properties.name+ "</strong> </span></span>";
});

svg.call(tip);


 
function updateChart(jsonFeature, getData, selectYear) {
	//convert string to number
	selectYear = parseInt(selectYear);
	//console.log(selectYear);
	//remove previous color
	d3.selectAll('.path').remove();
	//recolor
	var Scheme = svg.selectAll("path")
	.data(jsonFeature)
	.enter()
	.append("path")
	.attr('class', 'path')
	.attr("d", path)
	.style("stroke", "#fff")
	.style("stroke-width", "1");

	Scheme.attr("fill",  function(d){
		tmpData = [];
		//start from 1987
		tmpData = getData[selectYear-1988].values.filter(function (countries) {
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
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);

	   
}


d3.csv("data/processed_income_data.csv", function(data) {
	d3.json("data/countries.json", function(json){
		var getData = d3.nest()
					 .key(function(d){return d.Year;})
					  // .key(function(d){ if (d.Year % 2 == 0) {return d.Year; } 
					  // 	else{ return d.Year % 2 == 0;}})
					  .entries(data);
					
		//console.log(getData);
		/*var yearMenu = d3.select("#yearDropdown");
		  yearMenu
		  	.selectAll("option")
		      .data(getData)
		      .enter()
		      .append("option")
		      .attr("value", function(d){
		      	 //return d.key ;
		      	if (d.key % 2 == 0){
		         	return d.key ;
		      	 }
		      })
		      .text(function(d){
		       if (d.key % 2 == 0){
		          return d.key ;
		      	}
		      });
		      */
		  var zoom = d3.zoom()
		      .scaleExtent([1, scale0])
		      .on("zoom", zoomed);

		  svg.call(zoom);

		  function zoomed() {
		    var transform = d3.event.transform; 

		    svg.style("stroke-width", 1.5 / transform.k + "px");
		    svg.attr("transform", transform);
		  }

		  d3.select('#zoom-in').on('click', function() {
		    // Smooth zooming
		  	zoom.scaleBy(svg.transition().duration(750), 1.3);
		  });

		  d3.select('#zoom-out').on('click', function() {
		    // Ordinal zooming
		    zoom.scaleBy(svg, 1 / 1.3);
		  });

		var legend = d3.select("#map").append("svg")
		      			.attr("class", "legend")
		     			.attr("width", 140)
		    			.attr("height", 200)
		   				.selectAll("g")
						//.data(color.domain().slice().reverse())  
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

		//default year 1988
		updateChart(json.features, getData, 1988);

		//update chart
		selectBtn = document.querySelector('#Year');
		selectBtn.addEventListener('change', function() {
			updateChart(json.features, getData, selectBtn.value);
	});
	});

});


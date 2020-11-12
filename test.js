var width = 800
var height = 650
var padding = { top: 20, right: 20, bottom: 20, left: 20 };

var svg = d3.select('#medal-vis')
    .append("svg")
    .attr('width', 800)
    .attr('height',600);

var chartWidth = width - padding.left - padding.right;
var chartHeight = height - padding.top - padding.bottom;

xScale = d3.scaleBand()
        .range([0, chartWidth])
        .padding(0.1);
yScale = d3.scaleLinear()
        .range([chartHeight, 0]);


d3.csv('small_athlete_events.csv', dataPreprocessor).then(function(data) {
    longMedalCount = getMedalCount(data);
    xScale.domain(longMedalCount.map(function(d) { return d.medalType; }));
    yScale.domain([0, d3.max(longMedalCount, function(d) { return d.medalCount; })]);

    
    svg.selectAll(".bar")
        .data(longMedalCount)
        .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) { //console.log(d.medalType); 
            return xScale(d.medalType); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { //console.log(d.medalCount); 
            return yScale(d.medalCount);})
        .attr("height", function(d) { return height - yScale(d.medalCount); });

}
)

function dataPreprocessor(row) {
    return {
        'ID': row['ID'],
        'Medal': row['Medal']
    };
  }



function getMedalCount(data) {
    medalItems = ['Gold', 'Silver', 'Bronze', 'Non-medal'];
    medalCount = {'Gold': 0, 'Silver':0, 'Bronze':0, 'Non-medal':0}
    for(var i=0;i<data.length;i++) {
        if (data[i]['Medal'] === 'Gold') {
            medalCount['Gold'] += 1;
        }
        else if (data[i]['Medal'] === 'Silver') {
            medalCount['Silver'] += 1;
        }
        else if (data[i]['Medal'] === 'Bronze') {
            medalCount['Bronze'] += 1;
        }
        else {
            medalCount['Non-medal'] += 1;
        }
    }
    //console.log(medalCount);
    longMedalCount = [];
    //console.log(medalItems);
    for(var j=0;j<medalItems.length;j++) {
        tmp = {};
        tmp['medalType'] = medalItems[j];
        tmp['medalCount'] = medalCount[medalItems[j]]; 
        //console.log(tmp);
        longMedalCount.push(tmp);
    }
    console.log(longMedalCount);
    //console.log(longMedalCount.medalType, longMedalCount.medalCount);

    return longMedalCount;
}

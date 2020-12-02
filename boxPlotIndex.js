import * as freqVis from "./boxPlot.js"

/**********************
 Create frequencyPlot object
**********************/
// selection, transition_time, useYAxis, dotRadius, dotColor, dotOpacity, dotColorSelected, dotOpacitySelected
//var frequencyPlot = new freqVis.frequencyPlot("flavor",2000,false, 8, '#663300', 0.05, 'red', 1);
var frequencyPlot = new freqVis.frequencyPlot("sports",2000,false, 2, '#663300', 0.3, 'red', 1);

/**********************
 Data preprocessing
**********************/
function dataPreprocessorAthlete(row) {
    //console.log("preprocessing data");
    //console.log(row);
    return {
        'ID': +row['ID'],
        'Name': row['Name'],
        'gender': row['Sex'],
        'Age': +row['Age'],
        'country': row['Team'],
        'NOC': row['NOC'],
        'year': +row['Year'],
        'season': row['Season'],
        'sports': row['Sport'],
        'Event': row['Event'],
        'Medal': row['Medal'],
    };
}

/**********************
 Load the data
**********************/
var dataPath = {
    athletePath: "data/boxplot_slim_athlete_events.csv"
};

d3.csv(dataPath.athletePath, function(dataset) {
    console.log("Loading Athlete");
    //process data
    dataset.forEach(d => {
      d.ID = +d.ID;
      d.Name = d.Name;
      d.gender = d.Sex;
      d.Age = +d.Age;
      d.country = d.Team;
      d.NOC = d.NOC;
      d.year = +d.Year;
      d.season = d.Season;
      d.sports = d.Sport;
      d.Event = d.Event;
      d.Medal = d.Medal;
    });
    
    // add an attribute to each datacase, specifying whether or not it is selected
    // all datacases are not selected, by default
    dataset.forEach(function(d) {
      d.selected = false;
    });

    frequencyPlot.processed["sports"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.sports;})
    .rollup(function(d) {
      var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["country"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.country;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
        var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["gender"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.gender;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["year"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.year;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["sports_season"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.season;})
    .key(function(d) { return d.sports;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["sports_gender"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.gender;})
    .key(function(d) { return d.sports;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["country_season"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.season;})
    .key(function(d) { return d.country;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["country_gender"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.gender;})
    .key(function(d) { return d.country;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["year_season"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.season;})
    .key(function(d) { return d.year;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    frequencyPlot.processed["year_gender"] = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.gender;})
    .key(function(d) { return d.year;})
    .rollup(function(d) {
        var min = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),0)
      var max = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),1)
      var q1 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.25)
      var median = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.5)
      var q3 = d3.quantile(d.map(function(g) { return g.Age;}).sort(d3.ascending),.75)
      var interQuantileRange = q3 - q1
      min = Math.max(min, q1 - 1.5 * interQuantileRange)
      max = Math.min(max, q3 + 1.5 * interQuantileRange)
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, length: d.length})
    })
    .entries(dataset)

    dataset = frequencyPlot.updateY(dataset, frequencyPlot.sortMode);
    //console.log("ChartScale");
    //console.log(dataset);
    //console.log(frequencyPlot.bins);
    //console.log("Binned: ",frequencyPlot.binned);
    frequencyPlot.updateChart(dataset);

    /**********************
     Scrollytelling part
    **********************/
    // check whether different DOM components are within view to determine which
    // version of the frequencyPlot viz should be shown
    window.addEventListener('scroll', function(e) {
      var curr_selected = null;
      if (isInViewport(sports)) { curr_selected = "sports"; }
      else if (isInViewport(country)) { curr_selected = "country"; }
      else if (isInViewport(year)) { curr_selected = "year"; }
      else if (isInViewport(gender)) { curr_selected = "gender"; }
      console.log(curr_selected, "scrolling")


      if (frequencyPlot.selection !== curr_selected && curr_selected !== null) {
        frequencyPlot.selection = curr_selected;
        frequencyPlot.onYScaleChanged(dataset);
      }
    });
});


/*
isInViewport function from https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
*/
var isInViewport = function (elem) {
    if (elem !== null) {
      var bounding = elem.getBoundingClientRect();
      return (
          bounding.top >= 0 &&
          bounding.left >= 0 &&
          bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
    return false;
};

// select different coffee attribute components from DOM
var sports = document.querySelector('.scrollytelling-text #st_sports');
var country = document.querySelector('.scrollytelling-text #fp_country');
var year = document.querySelector('.scrollytelling-text #fp_year');
var gender = document.querySelector('.scrollytelling-text #fp_gender');


// move to the top of the page if the page is refreshed/reloaded
window.onload = function () {
    $('html,body').scrollTop(0);
}
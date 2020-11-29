//create year slider
Array.range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
var yearData = Array.range(12, 60);

var slider = d3.sliderHorizontal()
  .domain(d3.extent(yearData))
  .width(900)
  .tickFormat(d3.format('d'))
  .ticks(15)
  .step(1)
  .default(20);

var sliderg = d3.select("#age-slider").append("svg")
  .attr("width", 1200)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(30,30)");

sliderg.call(slider);

/*
window.onload = function() {
  d3.queue()  
    .defer(d3.json, 'data/all_selection_list2.json')
    .defer(d3.json, 'data/athlete_medal_probabilities.json')
    .await(function(error, selectorData, probData) {
      probData = JSON.parse(probData);
      var selectSeason2 = document.querySelector('#Season2')
      var selectSport2 = document.querySelector('#Sport2');
      var selectGender = document.querySelector('#Gender');
      var selectIncome = document.querySelector('#Income');
      //var selectAge = document
      
        // populate drop-downs
        /*
        setOptions(selectSeason2, Object.keys(selectorData));
        setOptions(selectSport2, Object.keys(selectorData[selectSeason2.value]));
        
        function setOptions(dropDown, options) {
          //sort alphabetically
          options.sort();
          dropDown.innerHTML = '';
    
          options.forEach(function(value) {
                //change summer default to a sport with more medals
                if (value == 'Basketball') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else if (value == 'Summer') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else {
                  dropDown.innerHTML += '<option name="' + value + '">' + value + '</option>';
                }
          });

        }
        
        // Create dummy data
        var data = {'Gold': 0.05, 'Silver': 0.15, 'Bronze':0.3, 'None':0.5};
        updatePie(data);

        
        selectSeason2.addEventListener('change', function() {
          setOptions(selectSport2, Object.keys(selectorData[selectSeason2.value]));
          pieData = probData[selectSeason2.value][selectSport2.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePie(pieData);
        });

        selectSport2.addEventListener('change', function() {
          pieData = probData[selectSeason2.value][selectSport2.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePie(pieData);
          
        });

        selectGender.addEventListener('change', function() {
          pieData = probData[selectSeason2.value][selectSport2.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePie(pieData);
        });
        

        //sliderAge

    }
)};
*/

var data = {'Gold': 0.05, 'Silver': 0.15, 'Bronze':0.3, 'None':0.5, 'Accuracy': 0.9};
updatePeople(data);


function updatePeople(data) {
  numVis = 100;
  //circle size
  r = 5;
  peopleData = {};
  uncertainCnt = numVis - Math.floor(numVis * data.Accuracy);
  //console.log(peopleData);
  sureCnt = Math.floor(numVis * data.Accuracy);
  peopleData = {'Gold': Math.floor(sureCnt*data.Gold), 
  'Silver': Math.floor(sureCnt*data.Silver),
  'Bronze': Math.floor(sureCnt*data.Bronze),
  'None': Math.floor(sureCnt*data.None),
  'Uncertain': uncertainCnt
};
  console.log(peopleData);

  medalType = ['Gold', 'Silver', 'Bronze', 'None', 'Uncertain'];
  goldArr = [];
  silverArr = [];
  bronzeArr = [];
  noneArr = [];
  uncertainArr = [];

  for (var i in medalType) {
    for (var j in [...Array(peopleData[medalType[i]]).keys()]) {
      if (medalType[i] === 'Gold') {
        goldArr.push('#FFD700');
      }
      else if (medalType[i] === 'Silver') {
        silverArr.push('#DCDCDC');
      }
      else if (medalType[i] === 'Bronze') {
        bronzeArr.push('#ED9B4D');
      }
      else if (medalType[i] === 'None') {
        noneArr.push('black');
      }
      else if (medalType[i] === 'Uncertain') {
        //no color for the circle
        uncertainArr.push('white');
      }
    }
  }
  console.log(goldArr, silverArr, bronzeArr, noneArr, uncertainArr);
  

  var width = 900;
    height = 20;
    margin = 0;



  for (var i in medalType) {
        if (medalType[i] === 'Gold') {
          if (goldArr.length > 0) {
          medalContainer = d3.select("#unit-vis")
            .append("svg")
            .attr("id", 'gold')
            .attr("width", width)
            .attr("height", height);
          medalContainer.selectAll("circle")
            .data(goldArr)
            .enter()
            .append("circle")
            .attr("cy", height/2)
            .attr("cx", function(d, i) {
                return (i+r)*2*r
            })
            .attr("r", r)
            .style("fill", d=>d);
          }
          medalContainer.append("text")
        }
        else if (medalType[i] === 'Silver') {
          if (silverArr.length > 0) {
          medalContainer = d3.select("#unit-vis")
            .append("svg")
            .attr("id", 'silver')
            .attr("width", width)
            .attr("height", height);
          medalContainer.selectAll("circle")
            .data(silverArr)
            .enter()
            .append("circle")
            .attr("cy", height/2)
            .attr("cx", function(d, i) {
                return (i+r)*2*r
            })
            .attr("r", r)
            //.style("stroke", 'black')
            .style("fill", d =>d);
          }
        }
        else if (medalType[i] === 'Bronze') {
          if (bronzeArr.length > 0) {
          medalContainer = d3.select("#unit-vis")
            .append("svg")
            .attr("id", 'bronze')
            .attr("width", width)
            .attr("height", height);
          medalContainer.selectAll("circle")
            .data(bronzeArr)
            .enter()
            .append("circle")
            .attr("cy", height/2)
            .attr("cx", function(d, i) {
                return (i+r)*2*r
            })
            .attr("r", r)
            //.style("stroke", 'black')
            .style("fill", d=>d);
          }
        }
        else if (medalType[i] === 'None') {
          if (noneArr.length > 0) {
          medalContainer = d3.select("#unit-vis")
            .append("svg")
            .attr("id", 'none')
            .attr("width", width)
            .attr("height", height);
          medalContainer.selectAll("circle")
            .data(noneArr)
            .enter()
            .append("circle")
            .attr("cy", height/2)
            .attr("cx", function(d, i) {
                return (i+r)*2*r
            })
            .attr("r", r)
            //.style("stroke", 'black')
            .style("fill", d=>d);
          }
        }
        else if (medalType[i] === 'Uncertain') {
          if (uncertainArr.length > 0) {
          medalContainer = d3.select("#unit-vis")
            .append("svg")
            .attr("id", 'uncertain')
            .attr("width", width)
            .attr("height", height);
          medalContainer.selectAll("circle")
            .data(uncertainArr)
            .enter()
            .append("circle")
            .attr("class", 'uncertain')
            .attr("cy", height/2)
            .attr("cx", function(d, i) {
                return (i+r)*2*r
            })
            .attr("r", r)
            .style("stroke", 'black')
            .style("fill", d => d);
        }
      }
    }

}
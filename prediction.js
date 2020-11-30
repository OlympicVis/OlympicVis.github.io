//create year slider
d3.queue()  
    .defer(d3.json, 'data/all_prediction_selection_list.json')
    .defer(d3.json, 'data/athlete_medal_probabilities.json')
    .defer(d3.json, 'data/sports_classification_accuracy.json')
    .await(function(error, preditorData, probData, accData) {
      //console.log(preditorData);
      //console.log(probData);
      //console.log(accData);
      probData = JSON.parse(probData.replace(/\bNaN\b/g, "null"));
      accData = JSON.parse(accData);
      //console.log(probData);
      //console.log(accData);
      var selectSeason2 = document.querySelector('#Season2')
      var selectSport2 = document.querySelector('#Sport2');
      var selectGender2 = document.querySelector('#Gender2');
      var selectIncome2 = document.querySelector('#Income2');
      
      //populate drop-downs
      setPredOptions(selectSeason2, Object.keys(preditorData));
      setPredOptions(selectSport2, Object.keys(preditorData[selectSeason2.value]));
      setPredOptions(selectGender2, Object.keys(preditorData[selectSeason2.value][selectSport2.value]));
      setPredOptions(selectIncome2, preditorData[selectSeason2.value][selectSport2.value][selectGender2.value]);
  

        
      function setPredOptions(dropDown, options) {
          //sort alphabetically
          options.sort();
          dropDown.innerHTML = '';
    
          options.forEach(function(value) {
                //set default selections
                if (value === 'Archery') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else if (value === 'Summer') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else if (value === 'M') {
                  dropDown.innerHTML += '<option selected=selected name="' + value + '">' + value + '</option>';
                }
                else if (value === "H") {
                  dropDown.innerHTML += '<option selected=selected value="' + value + '">' + "High-income countries" + '</option>';
                }
                else if (value === "UM") {
                  dropDown.innerHTML += '<option value="' + value + '">' + 'High-income countries' + '</option>';
                }
                else if (value === "LM") {
                  dropDown.innerHTML += '<option value="' + value + '">' + 'Upper-middle income countries' + '</option>';
                }
                else if (value === "L") {
                  dropDown.innerHTML += '<option value="' + value + '">' + 'Low-income countries' + '</option>';
                }

                else {
                  dropDown.innerHTML += '<option name="' + value + '">' + value + '</option>';
                }
          });

        }
        
        selectAge = 20;
        //create year slider
        Array.range = (start, end) => Array.from({length: (end - start)}, (v, k) => k + start);
        var yearData = Array.range(15, 60);
        var slider = d3.sliderHorizontal()
          .domain(d3.extent(yearData))
          .width(900)
          .tickFormat(d3.format('d'))
          .ticks(15)
          .step(1)
          .default(20)
          .on('onchange', val => {
            selectAge = val;
            //call function here
            //console.log(selectIncome2.value);
            nowData = probData[selectSeason2.value][selectSport2.value][selectGender2.value][selectIncome2.value][selectAge];
            nowData["Accuracy"] = parseFloat(accData[selectSport2.value].Accuracy);
            //onsole.log(nowData);
            removeAll();
            updatePeople(nowData);
          });;
        var sliderg = d3.select("#age-slider").append("svg")
          .attr("width", 1200)
          .attr("height", 100)
          .append("g")
          .attr("transform", "translate(30,30)");
        sliderg.call(slider);
        
        //default data
        nowData = {"None": 0.8366707215377126, 
          "Bronze": 0.05801009023384233, 
          "Gold": 0.056011105832798835, 
          "Silver": 0.04930808239564633, 
          "Accuracy": 0.9166666666666666};
        updatePeople(nowData);

        selectSeason2.addEventListener('change', function() {
          //console.log(selectSeason2.value);
          removeAll();
          setPredOptions(selectSport2, Object.keys(preditorData[selectSeason2.value]));
          nowData = probData[selectSeason2.value][selectSport2.value][selectGender2.value][selectIncome2.value][selectAge];
          nowData["Accuracy"] = parseFloat(accData[selectSport2.value].Accuracy);
          //nowData = probData[selectSeason2.value][selectSport2.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePeople(nowData);
        });

        selectSport2.addEventListener('change', function() {
          //console.log(selectSport2.value);
          removeAll();
          nowData = probData[selectSeason2.value][selectSport2.value][selectGender2.value][selectIncome2.value][selectAge];
          nowData["Accuracy"] = parseFloat(accData[selectSport2.value].Accuracy);
          updatePeople(nowData);
          
        });

        selectGender2.addEventListener('change', function() {
          //console.log(selectGender2.value);
          removeAll();
          nowData = probData[selectSeason2.value][selectSport2.value][selectGender2.value][selectIncome2.value][selectAge];
          nowData["Accuracy"] = parseFloat(accData[selectSport2.value].Accuracy);
          //nowData = probData[selectSeason2.value][selectSport2.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePeople(nowData);
        });

        selectIncome2.addEventListener('change', function() {
          //console.log(selectIncome2.value);
          removeAll();
          nowData = probData[selectSeason2.value][selectSport2.value][selectGender2.value][selectIncome2.value][selectAge];
          nowData["Accuracy"] = parseFloat(accData[selectSport2.value].Accuracy);
          //nowData = probData[selectSeason2.value][selectSport2.value][selectGender.value][selectIncome.value][selectAge.value];
          updatePeople(nowData);
        });
    });
  
function removeAll() {
  d3.select("#gold").remove();
  d3.select("#silver").remove();
  d3.select("#bronze").remove();
  d3.select("#uncertain").remove();
  d3.select("#none").remove();
}



function updatePeople(data) {
  numVis = 100;
  //circle size
  r = 5;
  peopleData = {};
  //console.log(peopleData);
  sureCnt = Math.floor(numVis * data.Accuracy);
  peopleData = {'Gold': Math.floor(sureCnt*data.Gold), 
  'Silver': Math.floor(sureCnt*data.Silver),
  'Bronze': Math.floor(sureCnt*data.Bronze),
  'None': 0,
  'Uncertain': numVis - sureCnt
};
  peopleData.None = numVis - peopleData.Gold - peopleData.Silver - peopleData.Bronze - peopleData.Uncertain;
  
  

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
  //console.log(goldArr, silverArr, bronzeArr, noneArr, uncertainArr);
  

  var width = 1200;
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
                return (i+10+r)*2*r
            })
            .attr("r", r)
            .style("fill", d=>d);
          }
          medalContainer.append("text")
            .attr('class', 'label')
            .attr('transform','translate(0, 15)')
            .text("Gold: "+ goldArr.length + "/100");
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
                return (i+10+r)*2*r
            })
            .attr("r", r)
            //.style("stroke", 'black')
            .style("fill", d =>d);
          
          medalContainer.append("text")
            .attr('class', 'label')
            .attr('transform','translate(0, 15)')
            .text("Silver: "+ silverArr.length + "/100");
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
                return (i+r+10)*2*r
            })
            .attr("r", r)
            //.style("stroke", 'black')
            .style("fill", d=>d);

          medalContainer.append("text")
          .attr('class', 'label')
          .attr('transform','translate(0, 15)')
          .text("Bronze: "+ bronzeArr.length + "/100");
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
                return (i+r+10)*2*r
            })
            .attr("r", r)
            //.style("stroke", 'black')
            .style("fill", d=>d);
          medalContainer.append("text")
          .attr('class', 'label')
          .attr('transform','translate(0, 15)')
          .text("No Medal: "+ noneArr.length + "/100");
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
                return (i+r+20)*2*r
            })
            .attr("r", r)
            .style("stroke", 'black')
            .style("fill", d => d);

          medalContainer.append("text")
          .attr('class', 'label')
          .style('fill', 'red')
          .attr('transform','translate(0, 15)')
          .text("When the model goes wrong: "+ uncertainArr.length + "/100");
          }
        }
      }
}
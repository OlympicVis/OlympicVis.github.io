window.onload = function() {
    // provs is an object but you can think of it as a lookup table
    d3.json('data/5k_selection_list.json').then(function(data) {
        console.log(data['Summer']);
        console.log(Object.keys(data['Summer']));    

          selectSeason = document.querySelector('#Season'),
          selectSport = document.querySelector('#Sport');
          selectEvent = document.querySelector('#Event');
        
          // populate drop-downs
          setOptions(selectSeason, Object.keys(data));
          setOptions(selectSport, Object.keys(data[selectSeason.value]));
          setOptions(selectEvent, data[selectSeason.value][selectSport.value]);
          
          // attach a change event listener to the provinces drop-down
          selectSeason.addEventListener('change', function() {
            setOptions(selectSport, Object.keys(data[selectSeason.value]));
            setOptions(selectEvent, data[selectSeason.value][selectSport.value]);
          });

          selectSport.addEventListener('change', function() {
            setOptions(selectEvent, data[selectSeason.value][selectSport.value]);
          });
            
          function setOptions(dropDown, options) {
            console.log(options);
            // clear out any existing values
            dropDown.innerHTML = '';
            // insert the new options into the drop-down
            options.forEach(function(value) {
              dropDown.innerHTML += '<option name="' + value + '">' + value + '</option>';
            });
          }  
    })
};

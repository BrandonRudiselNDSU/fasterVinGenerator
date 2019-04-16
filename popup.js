var storage = window.localStorage;
var searchCounter = storage.length;
var oldCarValue = false;

getOldCarValue();
getVin(); //get vin on load
getLudiValue();


submitButton.onclick = function () {   //this function runs upon clicking the submit button
    var input = searchString = document.getElementById('searchBox').value;
    if (input.charAt(0) == "/") {     //is a control command
        if (input.charAt(1) == "h")  //is a list history command
            listHistory();
        else if (input.charAt(1) == "i") //is an info request
            showInfo();
        else if (input.charAt(1) == "c") //is a clear history command
            clearHistory();
        else if (Number.isInteger(parseInt(input.charAt(1)))) { //is redoing a previous search
            // prepare search and category data for search
            var end = storage.length;
            searchString = storage.getItem(end - input.charAt(1));
            searchString = searchString.substr(searchString.indexOf("|| ") + 3, searchString.length - 1); //remove time stamp
            boxes = searchString.substr(searchString.indexOf(": ") + 2, searchString.length - 1); //grab categories
            boxes = boxes.trim();
            boxes = boxes.split(" "); //put categories in an array
            searchString = searchString.substr(0, searchString.indexOf(": ")); //remove categories from search phrase

            historyCopy(searchString);
        }
    }
    else if (input.charAt(0) == "") {
        location.reload();   //if nothing entered, refresh
    }
    else {   //is a search
        var historySearch = searchString = document.getElementById('searchBox').value + " : " + getCheckedBoxes(); //
        storage.setItem(searchCounter, getTimeStamp() + " || " + historySearch);
        searchCounter++;
        var boxes = getCheckedBoxes();
        boxes = boxes.split(" "); //prepare categories in array

        decodeVin(input);
        document.getElementById("vinBox").value = input
    }

    document.getElementById("searchBox").value = ""; //clean up search box
    document.getElementById("searchBox").focus();
    copied = false;
};

function search(searchString, boxes) {  //handles searching
    var output = "";
    var checked = 0;

    for (var i = 0; i < boxes.length; i++) { //read categories
        output += '<font size="5">' + boxes[i] + ':</font>' +
            '<br>Placeholder data for search: ' + searchString + '<br><br>';
        checked += 1;
    }

    if (searchString === "") {
        output = "Searched for nothing"; // check search
    }

    if (checked === 0) {
        output = "No categories specified"; // check categories
    }

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">'
        + output + '</font>';
}

function showInfo() {     //shows info
    var infoString = "It actually doesn't generate anything. It just randomly returns a hard coded vin.</br>" +
    "Ludicrous speed will immediately copy the vin to your clipboard.</br>" +
    "Old Car will return vehicles that range from 1980 - 2009.</br>" +
    "</br>Made by Brandon Rudisel.</br></br>" +
    "Hit enter to go back</br></br>" +
    "Powered by hatred, and NHTSA<br>";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + infoString + '</font>';
}

function listHistory() {     //lists search history
    var historyString = "Enter '/#' to copy an item to clipboard</br>Enter '/clear' to clear Search History</br></br>";
    var end = localStorage.length;
    for (var i = 1; i < searchCounter; i++) {
        historyString += i + ": " + storage.getItem(localStorage.key(end - i)) + "</br>";
    }

    document.getElementById("SearchResults").innerHTML =
       '<font color=\"white\">' + historyString + '</font>';
}

function clearHistory() {    //clears search history
    storage.clear();
    searchCounter = 1;
    var clearText = "Search History Cleared</br></br>Hit Enter";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + clearText + '</font>';
    storage.setItem(0, ""); //placeholder string for the zero-ith position
}

function getTimeStamp() {    //returns time stamp
    var date = new Date();
    var formattedDate = date.toDateString() + " " + date.getHours() + ":" + date.getMinutes() + "." + date.getSeconds();
    return formattedDate;
}

function getCheckedBoxes() {    //returns the values checked in the boxes
    var boxes = document.getElementsByName('searchType');
    var txt = "";
    var i;

    for (i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            txt = txt + boxes[i].value + " ";
        }
    }
    txt = txt.trim();
    return txt;
}

function copy() {
    var copyText = document.getElementById("vinBox");
    copyText.select();
    document.execCommand("copy");
    window.close();
}

function historyCopy(text) {
    document.getElementById("searchBox").value = text
    var copyText = document.getElementById("searchBox");
    copyText.select();
    document.execCommand("copy");
    window.close();
}

function decodeVin(vin){
    $.ajax({
    	url: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json",
    	type: "GET",
    	dataType: "json",
    	success: function(result){
    		printVehicleInfo(result.Results);
    	},
    	error: function(xhr, ajaxOptions, thrownError){
    		console.log(xhr.status);
    		console.log(thrownError);
    	}
    });
}

function printVehicleInfo(vehicleDataArray){
    //year make model
    document.getElementById("yearBox").value = vehicleDataArray[8].Value;
    document.getElementById("makeBox").value = vehicleDataArray[5].Value;
    document.getElementById("modelBox").value = vehicleDataArray[7].Value;

}

function getVin(){

    if(oldCarValue)
        var vin = vinArray[Math.floor(Math.random() * 787)]; //only hits old cars
    else
        var vin = vinArray[Math.floor(Math.random() * vinArray.length - 1)]; //hits any car
    document.getElementById("vinBox").value = vin;
    decodeVin(vin);
}

function getLudiValue() {
    if(document.getElementById("speed").checked){
        var millisecondsToWait = 200;
        setTimeout(function() {
            copy();
        }, millisecondsToWait);
    }
}

function getOldCarValue() {
    setBoxes();
    if(document.getElementById("oldCar").checked){
        oldCarValue = true;
    }
    else
        oldCarValue = false;
}

function setBoxes(){
    var checkboxValues = JSON.parse(localStorage.getItem('checkboxValues')) || {},
        $checkboxes = $("#SearchResults :checkbox");

    $checkboxes.on("change", function(){
      $checkboxes.each(function(){
        checkboxValues[this.id] = this.checked;
      });

      localStorage.setItem("checkboxValues", JSON.stringify(checkboxValues));
    });

    // On page load
    $.each(checkboxValues, function(key, value) {
      $("#" + key).prop('checked', value);
    });
}
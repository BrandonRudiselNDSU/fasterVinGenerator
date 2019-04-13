var storage = window.localStorage;
var searchCounter = storage.length;
var copied = false;

genVin(); //gen vin on load
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
    var infoString = "Powered by hatred, and NHTSA<br>" +
    //"Originally named 'vinny', hence the Joe Pesci iconography</br>" +
    "Why isn't it very random? vins r hard</br>Made by Brandon Rudisel, if you want to complain about it email me.</br></br>" +
    "Hit enter to go back";

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
    copied = true;
    window.close();
}

function historyCopy(text) {
    document.getElementById("searchBox").value = text
    var copyText = document.getElementById("searchBox");
    copyText.select();
    document.execCommand("copy");
    copied = true;
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

function genVin(){  //test 1GCGG29V441240916
    var vinPrefix = getPrefix();
    var vinPostfix = getVehicleIdentifier().toString();

    var checkDigit = getCheckDigit(vinPrefix + vinPostfix);
    var vinPrefix = setCharAt(vinPrefix, 8, checkDigit);

    vin = vinPrefix + vinPostfix;


    document.getElementById("vinBox").value = vin;
    decodeVin(vin);
}

function getPrefix(){
    //a prefix includes
    //digit 1 country eg america
    //digit 2 manufacturer eg GM
    //digit 3 brand eg Chevy
    //digits 4-8 vehicle attributes
    //digit 9 temp check digit
    //digit 10 year
    //digit 11 plant
    var rando = Math.floor(Math.random() * prefixArray.length) + 1;
    return prefixArray[rando] + "1";
}

function transliterate(char) {
    return "0123456789.ABCDEFGH..JKLMN.P.R..STUVWXYZ".indexOf(char) % 10;   //converts letters to numbers for calculation of check digit
}

function getCheckDigit(vin) {   //returns numerical for vin entered that will act as the validity check
    var map = "0123456789X";
    var weights = "8765432X098765432";
    var sum = 0;
    for (var i = 0; i < 17; ++i) {
        sum += transliterate(vin.charAt(i)) * map.indexOf(weights.charAt(i));
    }

    return map.charAt(sum % 11);
}

function getVehicleIdentifier() {
    return Math.floor(Math.random() * 999999) + 100000;  // returns a random integer between those numbers to get last 6 digits
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}





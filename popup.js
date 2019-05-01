//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB ||
window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction ||
window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
window.msIDBKeyRange

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

var storage = window.localStorage;
var oldCarValue = false;

getOldCarValue();
getVin(); //get vin on load
getLudiValue();

submitButton.onclick = function () {   //this function runs upon clicking the submit button
    //dataClean();
    //readAll();
    var input = document.getElementById('searchBox').value;
    if (input.charAt(0) == "/") {     //is a control command
        if (input.charAt(1) == "h")  //is a list history command
            listHistory();
        else if (input.charAt(1) == "i") //is an info request
            showInfo();
        else if (input.charAt(1) == "c") //is a clear history command
            clearHistory();
        else if (Number.isInteger(parseInt(input.charAt(1)))) { //is copy-ing a previous decoded vin
            // prepare decode by removing timestamp and decode
            var historyIndex = input.substr(1,input.length);            //remove "/" and return the number
            read(parseInt(historyIndex));
        }
    }
    else if (input.charAt(0) == "") {
        location.reload();   //if nothing entered, refresh
    }
    else {   //is a decode
        decodeVinAsyncOff(input);       //run with async off so that the result is definitely retrieved before stored
        var year = document.getElementById("yearBox").value;
        var make = document.getElementById("makeBox").value;
        var model = document.getElementById("modelBox").value;
        add(getTimeStamp() + " || " + input + " : " + year + " | " + make + " | " + model);
        document.getElementById("vinBox").value = input
    }

    document.getElementById("searchBox").value = ""; //clean up search box
    document.getElementById("searchBox").focus();
};

function showInfo() {
    var infoString = "It actually doesn't generate anything. It just randomly returns a hard coded vin.</br>" +
    "Ludicrous speed will immediately copy the vin to your clipboard.</br>" +
    "Old Car will return vehicles that range from 1980 - 2009.</br>" +
    "</br>Made by Brandon Rudisel.<br>Buy me beer: paypal.me/fasterVin</br></br>" +
    "Hit enter to go back</br></br>" +
    "Powered by hatred, and NHTSA<br>";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + infoString + '</font>';
}

function listHistory() {     //lists search history
    var historyString = "Enter '/#' to copy an item to clipboard</br>Enter '/clear' to clear History</br></br>";
    var printedIndex = 1;

    var transaction = db.transaction("record", "readonly");
    var objectStore = transaction.objectStore("record");
    var request = objectStore.openCursor(null,"prev");
    console.log("List history");
    request.onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
            historyString += printedIndex + ": " + cursor.value.record + "</br>";
            printedIndex++;
            cursor.continue();
        } else {
            // no more results
        }
    };
    setTimeout(function(){
        document.getElementById("SearchResults").innerHTML =
            '<font color=\"white\">' + historyString + '</font>';
    }, 50);

}

function clearHistory() {    //clears search history
    clearData();
    var clearText = "Search History Cleared</br></br>Hit Enter";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + clearText + '</font>';
}

function getTimeStamp() {    //returns time stamp
    var date = new Date();
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    var formattedDate = date.toDateString() + " " + hours.padStart(2,"0") + ":" + minutes.padStart(2,"0") + "." + seconds.padStart(2,"0");
    return formattedDate;
}

function copy() {
    var copyText = document.getElementById("vinBox");
    copyText.select();
    document.execCommand("copy");
    window.close();
}

function historyCopy(text) {
    document.getElementById("searchBox").value = text;
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
    var year = document.getElementById("yearBox").value = vehicleDataArray[8].Value;
    var make = document.getElementById("makeBox").value = vehicleDataArray[5].Value;
    var model = document.getElementById("modelBox").value = vehicleDataArray[7].Value;

}

function getVin(){
    if(oldCarValue)
        var vin = oldCarArray[Math.floor(Math.random() * oldCarArray.length - 1)];
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

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}


function dataClean(){
    var vin;

    for(var i = 0; i < vinArray.length; i++){
        vin = getVin;
        var result = decodeVinAsyncOffdataClean(vin,i);
    }
    alert("Finished");
}

function testData(vin, result, index){
    var testString = result[5].Value  //model 7, make 5, year 8
    if (testString.includes("uzuki")){
        alert("bad data for vin: " + vin + " on index: " + index);
    }
}

function decodeVinAsyncOffDataClean(vin, index){
    $.ajax({
    	url: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json",
    	type: "GET",
    	dataType: "json",
    	async: false,
    	success: function(result){
    	    testData(vin,result. Results, index); //for data clean
    	},
    	error: function(xhr, ajaxOptions, thrownError){
    		console.log(xhr.status);
    		console.log(thrownError);
    	}
    });
}

function decodeVinAsyncOff(vin){
    $.ajax({
    	url: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json",
    	type: "GET",
    	dataType: "json",
    	async: false,
    	success: function(result){
    	    //testData(vin,result. Results, index); //for data clean
            printVehicleInfo(result.Results);
    	},
    	error: function(xhr, ajaxOptions, thrownError){
    		console.log(xhr.status);
    		console.log(thrownError);
    	}
    });
}

/*===================================================================================
=====================================================================================
===================================================================================*/


var db;
var request = window.indexedDB.open("history", 2);

request.onerror = function(event) {
    console.log("error: new database failed");
};

request.onsuccess = function(event) {
    db = request.result;
    //console.log("success: "+ db);
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("record", {keyPath: "index"});
}

function read(index) {
    var transaction = db.transaction(["record"]);
    var objectStore = transaction.objectStore("record");
    var request = objectStore.get(index);

    request.onerror = function(event) {
        alert("Unable to retrieve data from database!");
    };

    request.onsuccess = function(event) {
    var oldVin;
        if(request.result) {
            oldVin = request.result.record;
            oldVin = oldVin.substr(oldVin.indexOf("|| ") + 3, oldVin.length - 1); //remove time stamp
            oldVin = oldVin.substr(0, oldVin.indexOf(" : ")); //remove year/make/model from text
            historyCopy(oldVin);
            alert(oldVin);
        } else {
            alert("Could not find value");
            console.log(request.error);
        }
    };
}

function add(record) {
    var transaction = db.transaction(["record"], "readonly");
    var objectStore = transaction.objectStore("record");

    var countRequest = objectStore.count();
    countRequest.onsuccess = function() {
        alert(countRequest.result);
        var request = db.transaction(["record"], "readwrite")
        .objectStore("record")
        .add({record: record}, countRequest.result + 1);

        request.onsuccess = function(event) {
            //do nothing
            //console.log("Add record");
        };
        request.onerror = function(event) {
            alert("Unable to add data");
        }
    }
    countRequest.onerror = function() {
        alert("failed to get count of records");
    }
}

function clearData(){
    var transaction = db.transaction(["record"],"readwrite");
    var objectStore = transaction.objectStore("record");

    objectStore.clear();

    transaction.onsuccess = function(event) {
      //alert("clear successful")
    };
    //Error Handler
    transaction.onerror = function (event) {
      alert("clear failed")
    };
}

function getCount(){
    var transaction = db.transaction(["record"], "readonly");
    var objectStore = transaction.objectStore("record");

    var countRequest = objectStore.count();
    countRequest.onsuccess = function() {
        return countRequest.result;
    }
}
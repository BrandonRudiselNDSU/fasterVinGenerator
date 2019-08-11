var oldCarValue = false;
var page = ""; //tracks what is currently displaying

getOldCarValue();
getVin(); //get vin on load
getSubheader(); //get subheader on load
getLudiValue();

submitButton.onclick = function () {   //this function runs upon clicking the submit button
    //dataClean();
    //readAll();
    var input = document.getElementById('searchBox').value;
    if (input.charAt(0) == "/") {     //is a control command
        if (input.charAt(1) == "h")  //is a list history command
            { listVinHistory(); page = "h"; }
        else if (input.charAt(1) == "d")  //is a list decode history command
            { listDecodeHistory(); page = "d"; }
        else if (input.charAt(1) == "s")  //is a super-user tip request
            { superUserTips(); page = "s"; }
        else if (input.charAt(1) == "i") //is an info request
            { showInfo(); page = "i"; }
        else if (input.charAt(1) == "c") //is a clear history command
            { clearHistory(); page = "c"; }
        else if (input.charAt(1) == "v") //is a channel Log command
            { showChannelLog(); page = "v"; }

        else if (Number.isInteger(parseInt(input.charAt(1)))) { //is copy-ing a previous vin
            var historyIndexString = input.substr(1,input.length);  //remove "/" and return the number
            var historyIndexInt = parseInt(historyIndexString);

            if(page == "d") { //is on decode history page. Is copy-ing a decode vin
                //prepare value by removing timestamp and decode
                var transaction = db.transaction(["decodeRecord"], "readonly");
                var objectStore = transaction.objectStore("decodeRecord");

                var countRequest = objectStore.count(); //get length of database
                countRequest.onsuccess = function() {
                    var dbLength = countRequest.result; //once result returns save it in dbLength
                    //subtract one to account for zero based index, then subtract historyIndexInt from dbLength to get desired value from history
                    read(dbLength - (historyIndexInt - 1), "decodeRecord");
                }

                countRequest.onerror = function() {
                    alert("Failed to get a count on number of values in database");
                }
            }

            else if(page == "h") { //is on copy history page. Is copy-ing a copied vin
                //prepare value by removing timestamp
                var transaction = db.transaction(["vinRecord"], "readonly");
                var objectStore = transaction.objectStore("vinRecord");

                var countRequest = objectStore.count(); //get length of database
                countRequest.onsuccess = function() {
                    var dbLength = countRequest.result; //once result returns save it in dbLength
                    //subtract one to account for zero based index, then subtract historyIndexInt from dbLength to get desired value from history
                    read(dbLength - (historyIndexInt - 1), "vinRecord");
                }

                countRequest.onerror = function() {
                    alert("Failed to get a count on number of values in database");
                }
            }
            else
                location.reload();   //if not on either page, refresh
        }
    }
    else if (input.charAt(0) == "" && page == "") { //it's on the main page, don't reload, just get a new vin
        //location.reload();
        getVin();
    }
    else if (input.charAt(0) == "" && page != "") { //it's not on the main page, reload
        location.reload();
    }
    else {   //is a decode
        decodeVinAsyncOff(input);       //run with async off so that the result is definitely retrieved before stored
        var year = document.getElementById("yearBox").value;
        var make = document.getElementById("makeBox").value;
        var model = document.getElementById("modelBox").value;
        document.getElementById("vinBox").value = input;
        add(getTimeStamp() + " || " + input + " : " + year + " | " + make + " | " + model, "decodeRecord");
    }

    document.getElementById("searchBox").value = ""; //clean up search box
    document.getElementById("searchBox").focus();
};

function listVinHistory() {     //lists vin history
    var historyString = "This is the history of VINS that have been generated and copied to the clipboard</br>" +
        "Enter '/#' to copy an item to clipboard</br></br>";
    var printedIndex = 1;

    var transaction = db.transaction("vinRecord", "readonly");
    var objectStore = transaction.objectStore("vinRecord");
    var request = objectStore.openCursor(null,"prev");
    console.log("List vin history");
    request.onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
            historyString += printedIndex + ": " + cursor.value.record + "</br>";
            printedIndex++;
            cursor.continue();
        } else {
            // no more results
        }
        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + historyString + '</font>';
    };
}

function listDecodeHistory() {     //lists vin decode history
    var historyString = "This is the history of VINS that have been decoded</br>" +
        "Enter '/#' to copy an item to clipboard</br></br>";
    var printedIndex = 1;

    var transaction = db.transaction("decodeRecord", "readonly");
    var objectStore = transaction.objectStore("decodeRecord");
    var request = objectStore.openCursor(null,"prev");
    console.log("List decode history");
    request.onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
            historyString += printedIndex + ": " + cursor.value.record + "</br>";
            printedIndex++;
            cursor.continue();
        } else {
            // no more results
        }
        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + historyString + '</font>';
    };
}

function showInfo() {
    var manifestData = chrome.runtime.getManifest();
    var version = manifestData.version;
    var infoString = "It actually doesn't generate anything. It just randomly returns a hard coded vin.</br>" +
    "Hover over options to learn their function.</br>" +
    "Made by Brandon Rudisel.<br>To send money: paypal.me/fasterVin</br>To send hate mail: brandonrudisel@gmail.com</br></br></br>" +
    "<b>Hit enter to go back</b></br>" +
    "Powered by hatred, and NHTSA </br><i>Version: " + version + "</i>";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + infoString + '</font>';
}

function showChannelLog() {     //Shows differences between versions
    var channelLog =
    "1.5.0.0 Add vin history in addition to decode history. New power commands. New subheaders. 08/11/19</br></br>" +
    "1.4.0.4 NHTSA changed their decode results, so I fixed that. 7/19/19</br></br>" +
    "1.4.0.3 Finished vin purge. Should always populate all fields. 7/14/19</br></br>" +
    "1.4.0.2 Began junk vin purge, removed about 100 vins. 6/30/19</br></br>" +
    "1.4.0.1 Removed 20-ish junk VINS 6/2/19</br></br>" +
    "1.4.0.0 add year option for HINS, minified for more speed, removed half(ish) of the Acuras 5/24/19</br></br>" +
    "1.3.1.0 I'm a stupid person and I did HINs wrong 5/20/19</br></br>" +
    "1.3.0.0 adds a HIN generator, ludicrous speed warning, and a new logo 5/19/19</br></br>" +
    "1.2.0.0 fixes decode history</br></br>" +
    "1.1.0.0 and earlier was before time. I dunno what happened back then.";

        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + channelLog + '</font>';
}

function superUserTips(){
    var superUserTips =
    "These are the super-user shortcuts and commands for Faster Vin Generator.</br>" +
    "Commands can be entered into the decode bar to use built-in tools.<br></br>" +
    "Shortcuts:</br>" +
    "<tt>Ctrl + Shift + Z opens and closes FVG</br>" +
    "Ctrl + C copies a VIN, and closes FVG</br>" +
    "Ctrl + A copies a HIN, and closes FVG</br>" +
    "Ctrl + Shift + Y clears options</br></br>" +
    "Commands:</br>" +
    "/h || List history of copied VINS</br>" +
    "/d || List history of decoded VINS</br>" +
    "/c || Clears history</br>" +
    "/i || Displays info about Faster Vin Generator</br>" +
    "/v || Displays version history<tt></br>";

        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + superUserTips + '</font>';
}

function clearHistory() {    //clears search history
    clearData();
    var clearText = "History Cleared</br></br>Hit Enter";

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
    var copyText = document.getElementById("vinBox").value;
    addCopied(getTimeStamp() + " || " + copyText, "vinRecord");
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
    //console.log(vehicleDataArray);
    var year = document.getElementById("yearBox").value = vehicleDataArray[9].Value;
    var make = document.getElementById("makeBox").value = vehicleDataArray[6].Value;
    var model = document.getElementById("modelBox").value = vehicleDataArray[8].Value;

}

function getVin(){
    if(oldCarValue)
        var vin = oldCarArray[Math.floor(Math.random() * (oldCarArray.length - 1))];
    else
        var vin = vinArray[Math.floor(Math.random() * (vinArray.length - 1))]; //hits any car
    document.getElementById("vinBox").value = vin;
    decodeVin(vin);
}

function getSubheader() {
    var index = Math.floor(Math.random() * (subheaderArray.length - 1));
    var subheader = subheaderArray[index]; //gets any subheader

    document.getElementById("subheader").innerHTML
        = '<font color=\"white\">' + subheader + '</font>';
}

function getLudiValue() {
    if(document.getElementById("speed").checked){
        copy();
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

    var hinYear = localStorage.getItem("hinYear");
    if(hinYear != 20)
        document.getElementById("hinYear").value = hinYear;
    else
        document.getElementById("hinYear").value = "";
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}


function dataClean(){
    var vin;
    for(var i = 0; i < vinArray.length; i++){
        vin = getVin;
        var result = decodeVinAsyncOffDataClean(vin,i);
    }
    alert("Finished");
}

function testData(vin, result, index){
    var testString = result[8].Value  //model 7, make 5, year 8
    if (parseInt(testString) > 2009){
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

hinButton.onclick = function () {
    getHin();
};

function getHin(){
    var hinYear = document.getElementById("hinYear").value;
    if(hinYear == "")
        hinYear = 20
    if(hinYear.length < 2)
        hinYear = "0" + hinYear
    document.getElementById("searchBox").focus();
    document.getElementById("vinBox").value = letters(3) + numbers(5) + hinMonth() + numbers(1) + hinYear;
    var year = document.getElementById("yearBox");
    var make = document.getElementById("makeBox");
    var model = document.getElementById("modelBox");
    year.style.display = "none";
    make.style.display = "none";
    model.style.display = "none";

    localStorage.setItem("hinYear", hinYear);
}

function letters(length) {
   var result           = '';
   var characters       = 'ABCDEFGHJKLMNPRSTUVWXYZ'; //removed IOQ
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function hinMonth() {
   var result           = '';
   var characters       = 'ABCDEFGHJKL'; //A is January, L is December. No I
   var charactersLength = characters.length;
   result += characters.charAt(Math.floor(Math.random() * charactersLength));
   return result;
}

function numbers(length){
    var result           = '';
   var characters       = '0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

speed.onclick = function () {
    if(document.getElementById("speed").checked)
        alert("Prepare the ship... for ludicrous speed!!! \nCRTL + SHIFT + Y to disable");
};
